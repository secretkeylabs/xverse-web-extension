import { Account, NetworkType } from '@secretkeylabs/xverse-core';
import { Resource } from './schemas';

type AccountResourceIdArgs = {
  masterPubKey: Account['masterPubKey'];
  accountId: Account['id'];
  networkType: NetworkType;
};

export function makeAccountResourceId(args: AccountResourceIdArgs) {
  return `account-${args.masterPubKey}-${args.accountId}-${args.networkType}`;
}

export function makeAccountResource(args: AccountResourceIdArgs): Resource {
  return {
    id: makeAccountResourceId(args),
    name: `Account ${args.accountId}, ${args.masterPubKey.slice(0, 6)}… (${args.networkType})`,
  };
}
