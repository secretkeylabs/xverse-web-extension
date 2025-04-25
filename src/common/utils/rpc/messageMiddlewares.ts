/* eslint-disable import/prefer-default-export */
import type { PermissionWithoutClientId, RpcRequestMessage } from '@sats-connect/core';
import { permissions } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';
import * as v from 'valibot';
import { getTabIdFromPort } from '..';
import getSelectedAccount from '../getSelectedAccount';
import { initPermissionsStore } from '../permissionsStore';
import { makeContext } from '../popup';
import { handleInvalidMessage } from './handleInvalidMessage';
import {
  sendAccessDeniedResponseMessage,
  sendInternalErrorMessage,
} from './responseMessages/errors';

// Helper types from
// https://github.com/typed-rocks/typescript/blob/main/one_of.ts
type MergeTypes<TypesArray extends any[], Res = {}> = TypesArray extends [infer Head, ...infer Rem]
  ? MergeTypes<Rem, Res & Head>
  : Res;
type OnlyFirst<F, S> = F & { [Key in keyof Omit<S, keyof F>]?: never };
type OneOf<
  TypesArray extends any[],
  Res = never,
  AllProperties = MergeTypes<TypesArray>,
> = TypesArray extends [infer Head, ...infer Rem]
  ? OneOf<Rem, Res | OnlyFirst<Head, AllProperties>, AllProperties>
  : Res;

type RequiredPermissionFunc = () => PermissionWithoutClientId;
type RequiredPermissions = Array<OneOf<[RequiredPermissionFunc, PermissionWithoutClientId]>>;

export function requirePermissions(
  requiredPermissions: RequiredPermissions,
  handler: (message: RpcRequestMessage, port: chrome.runtime.Port) => Promise<void>,
) {
  return async (message: RpcRequestMessage, port: chrome.runtime.Port): Promise<void> => {
    const { origin, tabId } = makeContext(port);

    const [error, store] = await initPermissionsStore();
    if (error) {
      sendInternalErrorMessage({
        tabId,
        messageId: message.id,
        message: 'Error loading permissions store.',
      });
      return;
    }

    const {
      selectedAccountIndex,
      selectedAccountType,
      selectedWalletId,
      softwareWallets,
      ledgerAccountsList,
      keystoneAccountsList,
      network,
    } = rootStore.store.getState().walletState;

    const existingAccount = getSelectedAccount({
      selectedAccountIndex,
      selectedAccountType,
      selectedWalletId,
      softwareWallets,
      ledgerAccountsList,
      keystoneAccountsList,
      network: network.type,
    });

    if (!existingAccount) {
      sendInternalErrorMessage({
        tabId: getTabIdFromPort(port),
        messageId: message.id,
        message: 'Failed to get selected account while checking permissions.',
      });
      return;
    }

    const [clientIdError, clientId] = permissions.utils.store.makeClientId({ origin });
    if (clientIdError) {
      sendInternalErrorMessage({
        tabId,
        messageId: message.id,
        message: 'Failed to create client ID during permissons check.',
      });
      return;
    }

    const currentPermissions = permissions.utils.store.getClientPermissions(store, clientId);
    const computedRequiredPermissions = requiredPermissions.map((permission) =>
      typeof permission === 'function' ? permission() : permission,
    );

    const hasRequiredPermissions = computedRequiredPermissions.every((requiredPermission) =>
      currentPermissions.some((currentPermission) => {
        if (currentPermission.type !== requiredPermission.type) return false;
        if (currentPermission.resourceId !== requiredPermission.resourceId) return false;

        const hasRequiredActions = Object.entries(requiredPermission.actions).every(
          ([action, value]) => currentPermission.actions[action] === value,
        );

        return hasRequiredActions;
      }),
    );

    if (!hasRequiredPermissions) {
      sendAccessDeniedResponseMessage({ tabId, messageId: message.id });
      return;
    }

    return handler(message, port);
  };
}

export function validateMessageSchema<
  const TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
  schema: TSchema,
  handler: (message: v.InferOutput<TSchema>, port: chrome.runtime.Port) => Promise<void> | void,
) {
  return async (message: RpcRequestMessage, port: chrome.runtime.Port) => {
    const parseResult = v.safeParse(schema, message);
    if (!parseResult.success) {
      handleInvalidMessage(message, getTabIdFromPort(port), parseResult.issues);
      return;
    }
    return handler(parseResult.output, port);
  };
}
