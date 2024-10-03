import {
  type AggregatedSummary,
  type Brc20Definition,
  type EtchActionDetails,
  type MintActionDetails,
  type RuneMint,
  type UserTransactionSummary,
} from '@secretkeylabs/xverse-core';
import { createContext, useContext } from 'react';
import type { Color } from '../../../../theme';

export type TxSummaryContextProps = {
  extractedTxSummary?: UserTransactionSummary | AggregatedSummary;
  runeMintDetails?: MintActionDetails;
  runeEtchDetails?: EtchActionDetails;
  brc20Summary?: Brc20Definition & { status: string; statusColor: Color };
  batchMintDetails?: (RuneMint | undefined)[];
};

export const TxSummaryContext = createContext<TxSummaryContextProps>({
  extractedTxSummary: undefined,
  runeMintDetails: undefined,
  runeEtchDetails: undefined,
  brc20Summary: undefined,
  batchMintDetails: undefined,
});

/**
 * This is a hook for internal components to get the extracted transaction summary.
 * The internal components would only be rendered if the extractedTxSummary is defined.
 * This allows internal components to not have to check for undefined values.
 */
export const useTxSummaryContext = (): {
  extractedTxSummary: UserTransactionSummary | AggregatedSummary;
  runeMintDetails?: MintActionDetails;
  runeEtchDetails?: EtchActionDetails;
  brc20Summary?: Brc20Definition & { status: string; statusColor: Color };
  batchMintDetails?: (RuneMint | undefined)[];
} => {
  const { extractedTxSummary, runeMintDetails, runeEtchDetails, brc20Summary, batchMintDetails } =
    useContext(TxSummaryContext);

  if (!extractedTxSummary) {
    // This should never happen in production
    throw new Error('extractedTxSummary is not defined for internal component');
  }

  return {
    extractedTxSummary,
    runeMintDetails,
    runeEtchDetails,
    brc20Summary,
    batchMintDetails,
  };
};
