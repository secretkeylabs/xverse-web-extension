/* eslint-disable no-restricted-syntax */
/* eslint-disable import/prefer-default-export */
import type { AccountWithDetails } from '@common/utils/getSelectedAccount';
import { AddressPurpose, AddressType, type Address } from '@sats-connect/core';

const purposeToAddress: Record<AddressPurpose, (account: AccountWithDetails) => Address> = {
  [AddressPurpose.Ordinals]: (a) => ({
    address: a.ordinalsAddress,
    publicKey: a.ordinalsPublicKey,
    purpose: AddressPurpose.Ordinals,
    addressType: AddressType.p2tr,
    walletType: a.accountType ?? 'software',
  }),
  [AddressPurpose.Payment]: (a) => ({
    address: a.btcAddress,
    publicKey: a.btcPublicKey,
    purpose: AddressPurpose.Payment,
    addressType: a.btcAddressType === 'native' ? AddressType.p2wpkh : AddressType.p2sh,
    walletType: a.accountType ?? 'software',
  }),
  [AddressPurpose.Stacks]: (a) => ({
    address: a.stxAddress,
    publicKey: a.stxPublicKey,
    purpose: AddressPurpose.Stacks,
    addressType: AddressType.stacks,
    walletType: a.accountType ?? 'software',
  }),
};

type PurposeOptions =
  | {
      type: 'select';
      purposes: AddressPurpose[];
    }
  | {
      type: 'all';
    };

export function accountPurposeAddresses(
  account: AccountWithDetails,
  purposeOptions: PurposeOptions,
) {
  const addresses: Address[] = [];

  if (purposeOptions.type === 'all') {
    for (const purpose of Object.values(AddressPurpose)) {
      addresses.push(purposeToAddress[purpose](account));
    }
    return addresses;
  }

  for (const purpose of purposeOptions.purposes) {
    addresses.push(purposeToAddress[purpose](account));
  }

  return addresses;
}
