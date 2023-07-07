import {
  decryptMnemonicWithCallback,
  encryptMnemonicWithCallback,
} from '@secretkeylabs/xverse-core/wallet';
import {aesGcmDecrypt, aesGcmEncrypt} from '@secretkeylabs/xverse-core/seedVault/encryptionUtils';
import argon2 from 'argon2-browser';
import { getSalt, saveSalt } from './localStorage';

export function generateRandomKey(bytesCount: number): string {
  const randomValues = Array.from(crypto.getRandomValues(new Uint8Array(bytesCount)));
  return randomValues.map((val) => `00${val.toString(16)}`.slice(-2)).join('');
}

export async function generateKeyArgon2(password: string, salt: string): Promise<string> {
  console.log("🚀 ~ file: encryptionUtils.ts:15 ~ generateKeyArgon2 ~ salt:", salt)
  console.log("🚀 ~ file: encryptionUtils.ts:15 ~ generateKeyArgon2 ~ password:", password)
  const result = await argon2.hash({
    pass: password,
    salt,
    time: 3,
    mem: 64 * 1024,
    parallelism: 4,
    hashLen: 128,
    type: argon2.ArgonType.Argon2id,
  });
  return result.hashHex;
}

export async function generatePasswordHash(password: string) {
  const existingSalt = getSalt();
  if (existingSalt) {
    const argonHash = await generateKeyArgon2(password, existingSalt);
    return {
      salt: existingSalt,
      hash: argonHash,
    };
  }
  const newSalt = generateRandomKey(16);
  saveSalt(newSalt);
  const argonHash = await generateKeyArgon2(password, newSalt);
  return {
    salt: newSalt,
    hash: argonHash,
  };
}

export async function encryptSeedPhrase(seed: string, password: string): Promise<string> {
  return encryptMnemonicWithCallback({
    seed,
    password,
    mnemonicEncryptionHandler: aesGcmEncrypt,
    passwordHashGenerator: generatePasswordHash,
  });
}

export async function decryptSeedPhrase(encryptedSeed: string, password: string): Promise<string> {
  try {
    const seedPhrase = await decryptMnemonicWithCallback({
      encryptedSeed,
      password,
      mnemonicDecryptionHandler: aesGcmDecrypt,
      passwordHashGenerator: generatePasswordHash,
    });
    return seedPhrase;
  } catch (err) {
    throw new Error('Invalid Password');
  }
}
