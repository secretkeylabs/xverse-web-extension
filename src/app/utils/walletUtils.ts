import BigNumber from 'bignumber.js';
import { c32addressDecode } from 'c32check';
import { Network } from './constant';

export const satsToBtc = (sats: BigNumber) => sats.multipliedBy(0.00000001);

export const btcToSats = (btc: BigNumber) => btc.multipliedBy(100000000);

export const microstacksToStx = (microstacks: BigNumber) => microstacks.multipliedBy(0.000001);

export const stxToMicrostacks = (stacks: BigNumber) => stacks.multipliedBy(1000000);

export const getStxFiatEquivalent = (
  stxAmount: BigNumber,
  stxBtcRate: BigNumber,
  btcFiatRate: BigNumber
) => microstacksToStx(stxAmount).multipliedBy(stxBtcRate).multipliedBy(btcFiatRate);

export const getBtcFiatEquivalent = (btcAmount: BigNumber, btcFiatRate: BigNumber) =>
  satsToBtc(btcAmount).multipliedBy(btcFiatRate);

export function validateStxAddress(stxAddress: string, network: Network) {
  try {
    const result = c32addressDecode(stxAddress);
    if (result[0] && result[1]) {
      const addressVersion = result[0];
      if (network === 'Mainnet') {
        if (
          !(
            addressVersion === AddressVersion.MainnetSingleSig ||
            addressVersion === AddressVersion.MainnetMultiSig
          )
        ) {
          return false;
        }
      } else if (
        result[0] !== AddressVersion.TestnetSingleSig &&
        result[0] !== AddressVersion.TestnetMultiSig
      ) {
        return false;
      }

      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// change
export function validateBtcAddress(btcAddress: string, network: Network): boolean {
  /* const btcNetwork =
      network === 'Mainnet'
        ? bitcoin.networks.bitcoin
        : bitcoin.networks.testnet;
    try {
      bitcoin.address.toOutputScript(btcAddress, btcNetwork); */
  return true;
}
