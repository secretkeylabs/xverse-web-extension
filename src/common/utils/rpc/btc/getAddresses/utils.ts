/* eslint-disable import/prefer-default-export */
import type { AccountWithDetails } from '@common/utils/getSelectedAccount';
import { AddressPurpose, AddressType } from '@sats-connect/core';

export function accountPurposeAddresses(account: AccountWithDetails, purposes: AddressPurpose[]) {
  return purposes.map((purpose) => {
    if (purpose === AddressPurpose.Ordinals) {
      return {
        address: account.ordinalsAddress,
        publicKey: account.ordinalsPublicKey,
        purpose: AddressPurpose.Ordinals,
        addressType: AddressType.p2tr,
      };
    }
    if (purpose === AddressPurpose.Stacks) {
      return {
        address: account.stxAddress,
        publicKey: account.stxPublicKey,
        purpose: AddressPurpose.Stacks,
        addressType: AddressType.stacks,
      };
    }
    return {
      address: account.btcAddress,
      publicKey: account.btcPublicKey,
      purpose: AddressPurpose.Payment,
      addressType: account.btcAddressType === 'native' ? AddressType.p2wpkh : AddressType.p2sh,
    };
  });
}
