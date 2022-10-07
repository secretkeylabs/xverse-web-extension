import { encryptSeedPhrase } from '@utils/encryptionUtils';
import { storeEncryptedSeed } from '@utils/localStorage';

// eslint-disable-next-line import/prefer-default-export
export const storeWalletSeed = async (seedphrase: string, password: string) => {
  try {
    const encryptedSeed = await encryptSeedPhrase(seedphrase, password);
    storeEncryptedSeed(encryptedSeed);
  } catch (err) {
    console.log('Failed to save Seed');
  }
};
