/* eslint-disable import/prefer-default-export */
import { txPayloadToRequest } from '@secretkeylabs/xverse-core';
import { StacksTransaction } from '@stacks/transactions';

interface GetPayloadArgs {
  decodedToken: Record<string, any>;
  transaction?: StacksTransaction;
}

export const getPayload = ({ decodedToken, transaction: stacksTransaction }: GetPayloadArgs) => {
  if (stacksTransaction) {
    const txPayload = txPayloadToRequest(
      stacksTransaction,
      decodedToken.payload.stxAddress,
      decodedToken.payload.attachment,
    );
    return {
      ...decodedToken.payload,
      ...txPayload,
    };
  }
  return decodedToken.payload;
};
