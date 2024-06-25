/* eslint-disable import/prefer-default-export */
import { makeAccountResourceId } from '@components/permissionsManager/resources';
import * as utils from '@components/permissionsManager/utils';
import rootStore from '@stores/index';

export async function hasPermissions(origin: string): Promise<boolean> {
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

  return true;
}
