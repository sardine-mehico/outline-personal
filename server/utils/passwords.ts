import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { ScryptOptions } from "node:crypto";

/**
 * Promise wrapper around scrypt that accepts cost options. Used instead of
 * util.promisify, whose inferred typing omits the options overload.
 */
function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve(derivedKey);
      }
    });
  });
}

/** scrypt CPU/memory cost parameter. */
const N = 2 ** 15;
/** scrypt block size parameter. */
const blockSize = 8;
/** scrypt parallelization parameter. */
const parallelization = 1;
/** Length of the derived key, in bytes. */
const keyLength = 64;
/** Length of the random per-password salt, in bytes. */
const saltLength = 16;
/** Upper bound on scrypt memory; must exceed 128 * N * blockSize bytes. */
const maxmem = 64 * 1024 * 1024;
/** Identifier stored as the first segment of every digest. */
const algorithm = "scrypt";

/**
 * Hashes a plaintext password into a salted, self-describing digest string of
 * the form `scrypt$N$r$p$saltBase64$keyBase64`. The parameters are embedded so
 * that verification continues to work if the cost factors are later changed.
 *
 * @param password the plaintext password to hash.
 * @returns a promise resolving to the digest string to persist.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(saltLength);
  const derivedKey = await scryptAsync(password, salt, keyLength, {
    N,
    r: blockSize,
    p: parallelization,
    maxmem,
  });

  return [
    algorithm,
    N,
    blockSize,
    parallelization,
    salt.toString("base64"),
    derivedKey.toString("base64"),
  ].join("$");
}

/**
 * Verifies a plaintext password against a digest produced by hashPassword using
 * a constant-time comparison. Returns false (rather than throwing) for any
 * malformed or unrecognized digest so callers can fail closed.
 *
 * @param password the plaintext password to check.
 * @param digest the stored digest to compare against.
 * @returns a promise resolving to true when the password matches.
 */
export async function verifyPassword(
  password: string,
  digest: string
): Promise<boolean> {
  const parts = digest.split("$");
  if (parts.length !== 6 || parts[0] !== algorithm) {
    return false;
  }

  const [, nValue, rValue, pValue, saltBase64, keyBase64] = parts;
  const salt = Buffer.from(saltBase64, "base64");
  const expectedKey = Buffer.from(keyBase64, "base64");

  if (salt.length === 0 || expectedKey.length === 0) {
    return false;
  }

  const derivedKey = await scryptAsync(password, salt, expectedKey.length, {
    N: Number(nValue),
    r: Number(rValue),
    p: Number(pValue),
    maxmem,
  });

  if (derivedKey.length !== expectedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, expectedKey);
}
