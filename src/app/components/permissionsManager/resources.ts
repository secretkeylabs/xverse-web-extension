import { Account, NetworkType } from '@secretkeylabs/xverse-core';
import { Resource } from './schemas';

export function makeAccountResourceId(args: {
  accountId: Account['id'];
  networkType: NetworkType;
}) {
  return `account-${args.accountId}-${args.networkType}`;
}

export function makeAccountResource(accountId: Account['id'], networkType: NetworkType): Resource {
  return {
    id: makeAccountResourceId({ accountId, networkType }),
    name: `Account ${accountId} (${networkType})`,
  };
}
