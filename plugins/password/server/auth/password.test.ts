import { faker } from "@faker-js/faker";
import { buildTeam, buildUser } from "@server/test/factories";
import { getTestServer } from "@server/test/support";
import PasswordResetEmail from "../email/templates/PasswordResetEmail";

const server = getTestServer();

const password = "correct-horse-battery-staple";

/**
 * Builds a team (with a unique subdomain) and a member, returning the host
 * header that resolves to that team so requests are routed deterministically.
 */
async function buildTeamWithUser() {
  const subdomain = faker.internet.domainWord();
  const team = await buildTeam({ subdomain });
  const user = await buildUser({ teamId: team.id });
  return { team, user, host: `${subdomain}.outline.dev` };
}

describe("#auth/password login", () => {
  it("signs in with correct credentials and establishes a session", async () => {
    const { user, host } = await buildTeamWithUser();
    await user.setPassword(password);
    await user.save();

    const res = await server.post("/auth/password", {
      body: { email: user.email, password },
      headers: { host },
      redirect: "manual",
    });

    expect(res.status).toEqual(302);
    const location = res.headers.get("location");
    // A successful sign-in redirects into the app, not back to the login screen
    // with an error notice.
    expect(location).toBeTruthy();
    expect(location).not.toContain("notice=auth-error");
  });

  it("rejects an incorrect password without revealing the account", async () => {
    const { user, host } = await buildTeamWithUser();
    await user.setPassword(password);
    await user.save();

    const res = await server.post("/auth/password", {
      body: { email: user.email, password: "the-wrong-password" },
      headers: { host },
      redirect: "manual",
    });

    expect(res.status).toEqual(302);
    expect(res.headers.get("location")).toContain("notice=auth-error");
  });

  it("rejects an unknown email with the same generic response", async () => {
    const { host } = await buildTeamWithUser();

    const res = await server.post("/auth/password", {
      body: { email: "nobody@example.com", password },
      headers: { host },
      redirect: "manual",
    });

    expect(res.status).toEqual(302);
    expect(res.headers.get("location")).toContain("notice=auth-error");
  });
});

describe("#auth/password.reset", () => {
  it("sends a reset email for a known account", async () => {
    const spy = vi.spyOn(PasswordResetEmail.prototype, "schedule");
    const { user, host } = await buildTeamWithUser();

    const res = await server.post("/auth/password.reset", {
      body: { email: user.email },
      headers: { host },
    });
    const body = await res.json();

    expect(res.status).toEqual(200);
    expect(body.success).toEqual(true);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("returns success without sending for an unknown account", async () => {
    const spy = vi.spyOn(PasswordResetEmail.prototype, "schedule");
    const { host } = await buildTeamWithUser();

    const res = await server.post("/auth/password.reset", {
      body: { email: "nobody@example.com" },
      headers: { host },
    });
    const body = await res.json();

    expect(res.status).toEqual(200);
    expect(body.success).toEqual(true);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("User password methods", () => {
  it("sets and verifies a password", async () => {
    const user = await buildUser();
    await user.setPassword(password);

    expect(await user.verifyPassword(password)).toBe(true);
    expect(await user.verifyPassword("not-the-password")).toBe(false);
  });

  it("returns false when no password is set", async () => {
    const user = await buildUser();
    expect(await user.verifyPassword(password)).toBe(false);
  });
});
