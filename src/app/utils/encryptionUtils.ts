import argon2 from 'argon2-browser';
import { encryptSeedPhrase, decryptSeedPhrase } from '@secretkeylabs/xverse-core/encryption';
import {
  encryptMnemonicWithHandler,
  decryptMnemonicWithHandler,
} from '@secretkeylabs/xverse-core/wallet';

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

export async function encryptSeedPhraseHandler(seed: string, password: string): Promise<string> {
  return encryptMnemonicWithHandler({
    seed,
    password,
    mnemonicEncryptionHandler: encryptSeedPhrase,
  });
}

export async function decryptSeedPhraseHandler(
  encryptedSeed: string,
  password: string,
): Promise<string> {
  try {
    const seedPhrase = await decryptMnemonicWithHandler({
      encryptedSeed,
      password,
      mnemonicDecryptionHandler: decryptSeedPhrase,
    });
    return seedPhrase;
  } catch (err) {
    throw new Error('Invalid Password');
  }
}
