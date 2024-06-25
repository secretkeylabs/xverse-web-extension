import { Account, NetworkType } from '@secretkeylabs/xverse-core';
import { Action, Client, Resource } from './schemas';

export function makeAccountResourceId(args: {
  accountId: Account['id'];
  networkType: NetworkType;
}) {
  return `account-${args.accountId}-${args.networkType}`;
}

export function makeAccountResource(accountId: Account['id'], networkType: NetworkType): Resource {
  return {
    id: makeAccountResourceId({ accountId, networkType }),
    name: `Account ${accountId}`,
  };
}

export function makeAccountPermissionDescription(actions: Set<Action>, client: Client) {
  if (!actions.has('read') || [...actions].length !== 1) {
    throw new Error('Only "read" account operations are supported at this time.');
  }

  const clientName = client.name ?? 'the application';

  const description =
    `View this account's addresses and balances. ` +
    `It does NOT allow ${clientName} to perform operations without your consent or spend your funds.`;

  return description;
}
