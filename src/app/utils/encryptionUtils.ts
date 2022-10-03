import argon2 from 'argon2-browser';
import { encryptMnemonic, decryptMnemonic } from '@stacks/encryption';
import { getSalt, saveSalt } from './localStorage';

function generateRandomKey(bytesCount: number): string {
  const randomValues = Array.from(crypto.getRandomValues(new Uint8Array(bytesCount)));
  return randomValues.map((val) => `00${val.toString(16)}`.slice(-2)).join('');
}

async function generateKeyArgon2(password: string, salt: string): Promise<string> {
  try {
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
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function encryptSeedPhrase(seed: string, password: string): Promise<string> {
  const salt = generateRandomKey(16);
  saveSalt(salt);
  const argonHash = await generateKeyArgon2(password, salt);
  const encryptedBuffer = await encryptMnemonic(seed, argonHash);
  return encryptedBuffer.toString('hex');
}

export async function decryptSeedPhrase(encryptedSeed: string, password: string): Promise<string> {
  const salt = getSalt();
  try {
    if (salt) {
      const pw = await generateKeyArgon2(password, salt);
      const secretKey = await decryptMnemonic(Buffer.from(encryptedSeed, 'hex'), pw);
      return secretKey;
    }
    return await Promise.reject(Error('Invalid Password'));
  } catch (err) {
    return Promise.reject(Error('Invalid Password'));
  }
}
