import Router from "koa-router";
import { ValidationError } from "@server/errors";
import auth from "@server/middlewares/authentication";
import { rateLimiter } from "@server/middlewares/rateLimiter";
import { transaction } from "@server/middlewares/transaction";
import validate from "@server/middlewares/validate";
import type { APIContext } from "@server/types";
import { RateLimiterStrategy } from "@server/utils/RateLimiter";
import * as T from "./schema";

const router = new Router();

router.post(
  "password.set",
  auth(),
  validate(T.PasswordSetSchema),
  transaction(),
  async (ctx: APIContext<T.PasswordSetReq>) => {
    const { password } = ctx.input.body;
    const { user } = ctx.state.auth;
    const { transaction } = ctx.state;

    if (user.passwordDigest) {
      throw ValidationError(
        "A password is already set. Use password.update to change it."
      );
    }

    await user.setPassword(password);
    await user.save({ transaction });

    ctx.body = { success: true };
  }
);

router.post(
  "password.update",
  rateLimiter(RateLimiterStrategy.TenPerMinute),
  auth(),
  validate(T.PasswordUpdateSchema),
  transaction(),
  async (ctx: APIContext<T.PasswordUpdateReq>) => {
    const { currentPassword, password } = ctx.input.body;
    const { user } = ctx.state.auth;
    const { transaction } = ctx.state;

    if (!(await user.verifyPassword(currentPassword))) {
      throw ValidationError("Current password is incorrect.");
    }

    await user.setPassword(password);
    await user.save({ transaction });

    ctx.body = { success: true };
  }
);

export default router;
