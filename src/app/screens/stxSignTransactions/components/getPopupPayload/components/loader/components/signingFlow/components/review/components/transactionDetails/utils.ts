import { PostConditionMode, type StacksTransactionWire } from '@stacks/transactions';

// TODO: Possibly this needs to be moved into common or xverse-core?
/**
 * Determines whether a transaction disallows transfers.
 *
 * Note: there is no "opposite" function to check whether a transaction allows
 * transfers. From inspecting the transaction alone, it is not possible to
 * determine if transfers are allowed since they depend on on-chain data.
 */
export function isNotAllowingTransfers(transaction: StacksTransactionWire) {
  const { postConditionMode } = transaction;
  const { postConditions } = transaction;
  return postConditionMode === PostConditionMode.Deny && postConditions.values.length === 0;
}

// This variable and related helpers are available in `@stacks.js/transactions`
// v7. This variable can be removed and the relevant helpers used when this repo
// upgrades to v7.
export const MICROSTX_IN_STX = 1_000_000;
