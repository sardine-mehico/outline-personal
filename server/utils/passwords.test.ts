import { hashPassword, verifyPassword } from "./passwords";

describe("password hashing", () => {
  it("produces a self-describing scrypt digest", async () => {
    const digest = await hashPassword("correct horse battery staple");
    const parts = digest.split("$");
    expect(parts[0]).toBe("scrypt");
    expect(parts).toHaveLength(6);
  });

  it("produces a different digest each time (random salt)", async () => {
    const a = await hashPassword("hunter2");
    const b = await hashPassword("hunter2");
    expect(a).not.toEqual(b);
  });

  it("verifies a correct password", async () => {
    const digest = await hashPassword("s3cret-passw0rd");
    expect(await verifyPassword("s3cret-passw0rd", digest)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const digest = await hashPassword("s3cret-passw0rd");
    expect(await verifyPassword("wrong-password", digest)).toBe(false);
  });

  it("returns false for a malformed digest", async () => {
    expect(await verifyPassword("anything", "")).toBe(false);
    expect(await verifyPassword("anything", "not-a-digest")).toBe(false);
    expect(await verifyPassword("anything", "bcrypt$1$2$3$4$5")).toBe(false);
  });
});
