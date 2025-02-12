import { aesGcmDecrypt, aesGcmEncrypt } from '@secretkeylabs/xverse-core';
import argon2 from 'argon2-browser';

export async function generateKeyArgon2id(password: string, salt: string): Promise<string> {
  const result = await argon2.hash({
    pass: password,
    salt,
    time: 3,
    mem: 64 * 1024,
    parallelism: 4,
    hashLen: 16,
    type: argon2.ArgonType.Argon2id,
  });
  return result.hashHex;
}

async function generateKeyArgon2i(password: string, salt: string): Promise<string> {
  const result = await argon2.hash({
    pass: password,
    salt,
    time: 3,
    mem: 64 * 1024,
    parallelism: 4,
    hashLen: 48,
    type: argon2.ArgonType.Argon2i,
  });
  return result.hashHex;
}

/**
 * Only used by the migration function that is run once on the first login after the update to the seed vault
 * @param password
 * @returns Argon2i hash and salt of the password
 */
export async function generatePasswordHash(password: string) {
  const unMigratedSalt = localStorage.getItem('salt');
  if (!unMigratedSalt) {
    throw new Error('No salt found');
  }
  const argonHash = await generateKeyArgon2i(password, unMigratedSalt);
  return {
    unMigratedSalt,
    hash: argonHash,
  };
}

export async function encryptionHandler(data: string, passwordHash: string): Promise<string> {
  return aesGcmEncrypt(data, passwordHash);
}

export async function decryptionHandler(
  encryptedData: string,
  passwordHash: string,
): Promise<string> {
  try {
    const data = await aesGcmDecrypt(encryptedData, passwordHash);
    return data;
  } catch (err) {
    throw new Error('Invalid Password');
  }
}
