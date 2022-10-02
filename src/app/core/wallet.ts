import * as bip39 from 'bip39';
import * as bip32 from 'bip32';
import {
  ChainID,
  getPublicKey,
  createStacksPrivateKey,
  publicKeyToString,
  TransactionVersion,
  getAddressFromPrivateKey,
} from '@stacks/transactions';
import { deriveRootKeychainFromMnemonic } from '@stacks/keychain';
import { ecPrivateKeyToHexString } from '@stacks/encryption';
import {
  BIP32Interface, ECPair, payments, networks,
} from 'bitcoinjs-lib';
import BN from 'bn.js';
import { encryptSeedPhrase } from '@utils/encryptionUtils';
import { storeEncryptedSeed } from '@utils/localStorage';
import {
  BTC_PATH_WITHOUT_INDEX,
  BTC_TESTNET_PATH_WITHOUT_INDEX,
  STX_PATH_WITHOUT_INDEX,
} from './constants/constants';
import { Network } from './types/networks';

const entropyBytes = 16;

export const derivationPaths = {
  [ChainID.Mainnet]: STX_PATH_WITHOUT_INDEX,
  [ChainID.Testnet]: STX_PATH_WITHOUT_INDEX,
};

export function getDerivationPath(chain: ChainID, index: BN) {
  return `${derivationPaths[chain]}${index.toString()}`;
}

export function getBitcoinDerivationPath(index: BN, network: Network = 'Mainnet') {
  return network === 'Mainnet'
    ? `${BTC_PATH_WITHOUT_INDEX}${index.toString()}`
    : `${BTC_TESTNET_PATH_WITHOUT_INDEX}${index.toString()}`;
}

export function deriveStxAddressChain(chain: ChainID, index: BN = new BN(0)) {
  return (rootNode: BIP32Interface) => {
    const childKey = rootNode.derivePath(getDerivationPath(chain, index));
    if (!childKey.privateKey) {
      throw new Error('Unable to derive private key from `rootNode`, bip32 master keychain');
    }
    const privateKey = ecPrivateKeyToHexString(childKey.privateKey);
    const txVersion = chain === ChainID.Mainnet
      ? TransactionVersion.Mainnet
      : TransactionVersion.Testnet;
    return {
      childKey,
      address: getAddressFromPrivateKey(privateKey, txVersion),
      privateKey,
    };
  };
}

export async function walletFromSeedPhrase(
  mnemonic: string,
  index: BN = new BN(0),
  network: Network = 'Mainnet',
): Promise<{
    stxAddress: string;
    btcAddress: string;
    masterPubKey: string;
    stxPublicKey: string;
    btcPublicKey: string;
    seedPhrase: string;
  }> {
  const rootNode = await deriveRootKeychainFromMnemonic(mnemonic);
  const deriveStxAddressKeychain = deriveStxAddressChain(
    network === 'Mainnet' ? ChainID.Mainnet : ChainID.Testnet,
    index,
  );
  const { childKey, address, privateKey } = deriveStxAddressKeychain(rootNode);
  const stxAddress = address;

  const seed = await bip39.mnemonicToSeed(mnemonic);
  const master = bip32.fromSeed(seed);
  const masterPubKey = master.publicKey.toString('hex');
  const stxPublicKey = publicKeyToString(getPublicKey(createStacksPrivateKey(privateKey)));

  // derive segwit btc address

  const btcChild = master.derivePath(getBitcoinDerivationPath(index, network));

  const keyPair = ECPair.fromPrivateKey(btcChild.privateKey!);
  const segwitBtcAddress = payments.p2sh({
    redeem: payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: network === 'Mainnet' ? networks.bitcoin : networks.testnet,
    }),
    pubkey: keyPair.publicKey,
    network: network === 'Mainnet' ? networks.bitcoin : networks.testnet,
  });
  const btcAddress = segwitBtcAddress.address!;
  const btcPublicKey = keyPair.publicKey.toString('hex');
  return {
    stxAddress,
    btcAddress,
    masterPubKey,
    stxPublicKey,
    btcPublicKey,
    seedPhrase: mnemonic,
  };
}

export async function newWallet(): Promise<{
  stxAddress: string;
  btcAddress: string;
  masterPubKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  seedPhrase: string;
}> {
  const entropy = crypto.getRandomValues(new Uint8Array(entropyBytes));
  const mnemonic = bip39.entropyToMnemonic(entropy);
  return walletFromSeedPhrase(mnemonic);
}

export async function getBtcPrivateKey(
  seedPhrase: string,
  index: BN = new BN(0),
  network: Network = 'Mainnet',
): Promise<string> {
  const seed = await bip39.mnemonicToSeed(seedPhrase);
  const master = bip32.fromSeed(seed);

  const btcChild = master.derivePath(getBitcoinDerivationPath(index, network));
  return btcChild.privateKey!.toString('hex');
}

export const storeWalletSeed = async (seedphrase: string, password: string) => {
  try {
    const encryptedSeed = await encryptSeedPhrase(seedphrase, password);
    storeEncryptedSeed(encryptedSeed);
  } catch (err) {
    console.log('Failed to save Seed');
  }
};
