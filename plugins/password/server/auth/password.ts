import Router from "koa-router";
import { UserRole } from "@shared/types";
import { parseDomain } from "@shared/utils/domains";
import { errToString } from "@shared/utils/error";
import slugify from "@shared/utils/slugify";
import teamCreator from "@server/commands/teamCreator";
import env from "@server/env";
import { InvalidAuthenticationError, ValidationError } from "@server/errors";
import { rateLimiter } from "@server/middlewares/rateLimiter";
import { transaction } from "@server/middlewares/transaction";
import validate from "@server/middlewares/validate";
import { Team, User } from "@server/models";
import type { APIContext } from "@server/types";
import { RateLimiterStrategy } from "@server/utils/RateLimiter";
import { signIn } from "@server/utils/authentication";
import { getUserForPasswordResetToken } from "@server/utils/jwt";
import { hashPassword, verifyPassword } from "@server/utils/passwords";
import PasswordResetEmail from "../email/templates/PasswordResetEmail";
import * as T from "./schema";

const router = new Router();

/**
 * A digest used to spend an equivalent amount of time hashing when no user is
 * found during login, so that response timing does not reveal whether an email
 * address has an account.
 */
let dummyDigest: Promise<string> | undefined;
const getDummyDigest = () =>
  (dummyDigest ??= hashPassword("a-dummy-password-for-constant-timing"));

/**
 * Resolves the team a pre-authentication request is targeting from its hostname,
 * mirroring the resolution used by the email sign-in provider.
 *
 * @param ctx the request context.
 * @returns the matching team, or null/undefined when none applies.
 */
async function getTeamForRequest(
  ctx: APIContext
): Promise<Team | null | undefined> {
  const domain = parseDomain(ctx.request.hostname);

  if (!env.isCloudHosted) {
    return Team.scope("withAuthenticationProviders").findOne();
  }
  if (domain.custom) {
    return Team.scope("withAuthenticationProviders").findOne({
      where: { domain: domain.host.toLowerCase() },
    });
  }
  if (domain.teamSubdomain) {
    return Team.scope("withAuthenticationProviders").findOne({
      where: { subdomain: domain.teamSubdomain },
    });
  }
  return undefined;
}

/**
 * Redirects back to the login screen with a generic error notice. Used instead
 * of throwing so that native form submissions do not surface a raw JSON error.
 *
 * @param ctx the request context.
 * @param err the underlying error to describe.
 */
const redirectWithError = (ctx: APIContext, err: unknown) =>
  ctx.redirect(
    `/?notice=auth-error&description=${encodeURIComponent(errToString(err))}`
  );

router.post(
  "password",
  rateLimiter(RateLimiterStrategy.FivePerMinute),
  validate(T.PasswordLoginSchema),
  async (ctx: APIContext<T.PasswordLoginReq>) => {
    const { email, password, client } = ctx.input.body;
    const team = await getTeamForRequest(ctx);

    const user = team
      ? await User.scope("withTeam").findOne({
          where: { teamId: team.id, email: email.toLowerCase().trim() },
        })
      : null;

    // Always run a verification, even without a matching user, to keep the
    // response time uniform and avoid leaking which emails have accounts.
    const passwordMatches = user
      ? await user.verifyPassword(password)
      : await verifyPassword(password, await getDummyDigest());

    if (!user || !passwordMatches) {
      return redirectWithError(
        ctx,
        InvalidAuthenticationError("Invalid email or password")
      );
    }

    return signIn(ctx, "password", {
      user,
      team: user.team,
      isNewTeam: false,
      isNewUser: false,
      client,
    });
  }
);

router.post(
  "password.register",
  rateLimiter(RateLimiterStrategy.TenPerHour),
  validate(T.PasswordRegisterSchema),
  transaction(),
  async (ctx: APIContext<T.PasswordRegisterReq>) => {
    const { teamName, name, email, password, client } = ctx.input.body;
    const { transaction } = ctx.state;
    const normalizedEmail = email.toLowerCase().trim();
    const existingTeam = await getTeamForRequest(ctx);

    // If a workspace already exists for this request, register the user as a
    // member of it (self-service join) rather than creating another workspace.
    if (existingTeam) {
      if (existingTeam.inviteRequired) {
        throw ValidationError(
          "This workspace requires an invitation to join. Ask an administrator for an invite."
        );
      }

      const existingUser = await User.findOne({
        where: { teamId: existingTeam.id, email: normalizedEmail },
        transaction,
      });
      if (existingUser) {
        throw ValidationError(
          "An account already exists for this email. Please sign in instead."
        );
      }

      const user = await User.createWithCtx(ctx, {
        name,
        email: normalizedEmail,
        teamId: existingTeam.id,
        role: UserRole.Member,
      });
      await user.setPassword(password);
      await user.save({ transaction });

      return signIn(ctx, "password", {
        user,
        team: existingTeam,
        isNewTeam: false,
        isNewUser: true,
        client,
      });
    }

    // No workspace yet (self-hosted first run, or a new cloud workspace): create
    // one with this user as its admin.
    const team = await teamCreator(ctx, {
      name: teamName,
      subdomain: slugify(teamName),
      authenticationProviders: [
        { name: "password", providerId: slugify(teamName) },
      ],
    });

    const user = await User.createWithCtx(ctx, {
      name,
      email: normalizedEmail,
      teamId: team.id,
      role: UserRole.Admin,
    });

    await user.setPassword(password);
    await user.save({ transaction });

    return signIn(ctx, "password", {
      user,
      team,
      isNewTeam: true,
      isNewUser: true,
      client,
    });
  }
);

router.post(
  "password.reset",
  rateLimiter(RateLimiterStrategy.FivePerHour),
  validate(T.PasswordResetSchema),
  async (ctx: APIContext<T.PasswordResetReq>) => {
    const { email, client } = ctx.input.body;
    const team = await getTeamForRequest(ctx);

    if (team) {
      const user = await User.scope("withTeam").findOne({
        where: { teamId: team.id, email: email.toLowerCase().trim() },
      });

      if (user && !user.isSuspended) {
        await new PasswordResetEmail({
          to: user.email,
          language: user.language,
          token: user.getPasswordResetToken(),
          teamUrl: team.url,
          client,
        }).schedule();

        user.lastSigninEmailSentAt = new Date();
        await user.save();
      }
    }

    // Respond with success regardless of whether an account exists, to avoid
    // revealing which email addresses are registered.
    ctx.body = { success: true };
  }
);

const passwordResetCallback = async (
  ctx: APIContext<T.PasswordResetCallbackReq>
) => {
  const { token, password, client } = ctx.input.body;

  let user: User;
  try {
    user = await getUserForPasswordResetToken(token);
  } catch (err) {
    return redirectWithError(ctx, err);
  }

  if (user.isSuspended) {
    return ctx.redirect("/?notice=user-suspended");
  }

  await user.setPassword(password);
  await user.save();

  return signIn(ctx, "password", {
    user,
    team: user.team,
    isNewTeam: false,
    isNewUser: false,
    client,
  });
};

router.post(
  "password.reset.callback",
  rateLimiter(RateLimiterStrategy.FivePerMinute),
  validate(T.PasswordResetCallbackSchema),
  passwordResetCallback
);

export default router;
