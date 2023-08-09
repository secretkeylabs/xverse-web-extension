import argon2 from 'argon2-browser';
import {
  decryptMnemonicWithCallback,
  encryptMnemonicWithCallback,
} from '@secretkeylabs/xverse-core/seedVault/encryptionUtils';
import { SeedVaultStorageKeys } from '@secretkeylabs/xverse-core';
import { decryptMnemonic, encryptMnemonic } from '@stacks/encryption';
import { getSessionItem, setSessionItem } from './sessionStorageUtils';

export function generateRandomKey(bytesCount: number): string {
  const randomValues = Array.from(crypto.getRandomValues(new Uint8Array(bytesCount)));
  return randomValues.map((val) => `00${val.toString(16)}`.slice(-2)).join('');
}

export async function generateKeyArgon2(password: string, salt: string): Promise<string> {
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
  const argonHash = await generateKeyArgon2(password, salt);
  return {
    salt,
    hash: argonHash,
  };
}

export async function encryptSeedPhrase(seed: string, password: string): Promise<string> {
  return encryptMnemonicWithCallback({
    seed,
    password,
    mnemonicEncryptionHandler: encryptMnemonic,
  });
}

export async function decryptSeedPhrase(encryptedSeed: string, password: string): Promise<string> {
  try {
    const seedPhrase = await decryptMnemonicWithCallback({
      encryptedSeed,
      password,
      mnemonicDecryptionHandler: decryptMnemonic,
    });
    return seedPhrase;
  } catch (err) {
    throw new Error('Invalid Password');
  }
}
