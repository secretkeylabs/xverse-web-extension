import argon2 from 'argon2-browser';
import { generateRandomKey, encryptSeed, decryptSeed } from '@secretkeylabs/xverse-core/encryption';
import {
  encryptMnemonicWithHandler,
  decryptMnemonicWithHandler,
} from '@secretkeylabs/xverse-core/wallet';
import { SeedVaultStorageKeys } from '@secretkeylabs/xverse-core/seedVault';
import { getSessionItem } from './sessionStorageUtils';

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

export async function generateKeyArgon2i(password: string, salt: string): Promise<string> {
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

export async function generatePasswordHash(password: string) {
  let salt = await getSessionItem(SeedVaultStorageKeys.PASSWORD_SALT);
  const unMigratedSalt = localStorage.getItem('salt');
  if (!salt && !unMigratedSalt) {
    salt = generateRandomKey(16);
  } else {
    salt = unMigratedSalt || salt;
  }
  const argonHash = await generateKeyArgon2i(password, salt);
  return {
    salt,
    hash: argonHash,
  };
}

export async function encryptSeedPhrase(seed: string, password: string): Promise<string> {
  return encryptMnemonicWithHandler({
    seed,
    password,
    mnemonicEncryptionHandler: encryptSeed,
  });
}

export async function decryptSeedPhrase(encryptedSeed: string, password: string): Promise<string> {
  try {
    const seedPhrase = await decryptMnemonicWithHandler({
      encryptedSeed,
      password,
      mnemonicDecryptionHandler: decryptSeed,
    });
    return seedPhrase;
  } catch (err) {
    throw new Error('Invalid Password');
  }
}
