/* eslint-disable import/prefer-default-export */
import { makeAccountResourceId } from '@components/permissionsManager/resources';
import * as utils from '@components/permissionsManager/utils';
import { AddressPurpose, AddressType } from '@sats-connect/core';
import { Account } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';

export function accountPurposeAddresses(account: Account, purposes: AddressPurpose[]) {
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
      addressType: account?.accountType === 'ledger' ? AddressType.p2wpkh : AddressType.p2sh,
    };
  });
}

export async function hasPermissions(origin: string) {
  const [error, store] = await utils.loadPermissionsStore();

  if (error) {
    return false;
  }

  if (!store) {
    return false;
  }

  const { selectedAccountIndex, network } = rootStore.store.getState().walletState;

  const permission = utils.getClientPermission(
    store.permissions,
    origin,
    makeAccountResourceId({ accountId: selectedAccountIndex, networkType: network.type }),
  );
  if (!permission) {
    return false;
  }

  if (!permission.actions.has('read')) {
    return false;
  }
}
