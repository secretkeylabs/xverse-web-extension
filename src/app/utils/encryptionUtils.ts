import {
  decryptMnemonicWithCallback,
  encryptMnemonicWithCallback,
} from '@secretkeylabs/xverse-core/wallet';
import argon2 from 'argon2-browser';
import { getSalt, saveSalt } from './localStorage';

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

/**
 * Encrypts plaintext using AES-GCM with supplied password, for decryption with aesGcmDecrypt().
 *                                                                      (c) Chris Veness MIT Licence
 *
 * @param   {String} plaintext - Plaintext to be encrypted.
 * @param   {String} password - Password to use to encrypt plaintext.
 * @returns {String} Encrypted ciphertext.
 *
 * @example
 *   const ciphertext = await aesGcmEncrypt('my secret text', 'pw');
 *   aesGcmEncrypt('my secret text', 'pw').then(function(ciphertext) { console.log(ciphertext); });
 */
export async function aesGcmEncrypt(
  plaintext: string,
  password: string
): Promise<string> {
  const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
  const pwHash = await crypto.subtle.digest("SHA-256", pwUtf8); // hash the password

  const iv = crypto.getRandomValues(new Uint8Array(12)); // get 96-bit random iv
  const ivStr = Buffer.from(iv).toString("base64"); // iv as base64 string

  const alg = { name: "AES-GCM", iv }; // specify algorithm to use

  const key = await crypto.subtle.importKey("raw", pwHash, alg, false, [
    "encrypt",
  ]); // generate key from pw

  const ptUint8 = new TextEncoder().encode(plaintext); // encode plaintext as UTF-8
  const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8); // encrypt plaintext using key

  const ctStr = Buffer.from(ctBuffer).toString("base64"); // ciphertext as base64 string

  return `${ivStr}.${ctStr}`;
}

/**
 * Decrypts ciphertext encrypted with aesGcmEncrypt() using supplied password.
 *                                                                      (c) Chris Veness MIT Licence
 *
 * @param   {String} ciphertext - Ciphertext to be decrypted.
 * @param   {String} password - Password to use to decrypt ciphertext.
 * @returns {String} Decrypted plaintext.
 *
 * @example
 *   const plaintext = await aesGcmDecrypt(ciphertext, 'pw');
 *   aesGcmDecrypt(ciphertext, 'pw').then(function(plaintext) { console.log(plaintext); });
 */
export async function aesGcmDecrypt(
  ciphertext: string,
  password: string
): Promise<string> {
  const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
  const pwHash = await crypto.subtle.digest("SHA-256", pwUtf8); // hash the password

  if (ciphertext.indexOf(".") === -1) {
    throw new Error("Invalid ciphertext");
  }
  const cipherSplitted = ciphertext.split(".");

  const ivStr = cipherSplitted[0]; // decode base64 iv
  const iv = Buffer.from(ivStr, "base64"); // iv as Uint8Array

  const alg = { name: "AES-GCM", iv }; // specify algorithm to use

  const key = await crypto.subtle.importKey("raw", pwHash, alg, false, [
    "decrypt",
  ]); // generate key from pw

  const ctStr = cipherSplitted[1]; // decode base64 iv
  const ctUint8 = Buffer.from(ctStr, "base64"); // ciphertext as Uint8Array

  try {
    const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8); // decrypt ciphertext using key
    const plaintext = new TextDecoder().decode(plainBuffer); // plaintext from ArrayBuffer
    return plaintext; // return the plaintext
  } catch (e) {
    throw new Error("Decrypt failed");
  }
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
