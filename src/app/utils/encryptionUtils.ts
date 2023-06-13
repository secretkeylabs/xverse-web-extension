import {
  decryptMnemonicWithCallback,
  encryptMnemonicWithCallback,
} from '@secretkeylabs/xverse-core/wallet';
import { decryptMnemonic, encryptMnemonic } from '@stacks/encryption';
import argon2 from 'argon2-browser';
import { getSalt, saveSalt } from './localStorage';

function generateRandomKey(bytesCount: number): string {
  const randomValues = Array.from(crypto.getRandomValues(new Uint8Array(bytesCount)));
  return randomValues.map((val) => `00${val.toString(16)}`.slice(-2)).join('');
}

async function generateKeyArgon2(password: string, salt: string): Promise<string> {
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
    mnemonicEncryptionHandler: encryptMnemonic,
    passwordHashGenerator: generatePasswordHash,
  });
}

export async function decryptSeedPhrase(encryptedSeed: string, password: string): Promise<string> {
  try {
    const seedPhrase = await decryptMnemonicWithCallback({
      encryptedSeed,
      password,
      mnemonicDecryptionHandler: decryptMnemonic,
      passwordHashGenerator: generatePasswordHash,
    });
    return seedPhrase;
  } catch (err) {
    throw new Error('Invalid Password');
  }
}
