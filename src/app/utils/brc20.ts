import type { brc20TransferEstimateFees, FungibleToken } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';

type TransferEstimateResult = Awaited<ReturnType<typeof brc20TransferEstimateFees>>;

export type Brc20TransferEstimateFeesParams = {
  tick: string;
  amount: number;
  feeRate: number;
  revealAddress: string;
};

export type ConfirmBrc20TransferState = {
  recipientAddress: string;
  estimateFeesParams: Brc20TransferEstimateFeesParams;
  estimatedFees: TransferEstimateResult;
  token: FungibleToken;
};

export type ExecuteBrc20TransferState = {
  recipientAddress: string;
  estimateFeesParams: Brc20TransferEstimateFeesParams;
  token: FungibleToken;
};

export const getFeeValuesForBrc20OneStepTransfer = ({
  commitChainFee,
  revealChainFee,
  transferChainFee,
  revealServiceFee,
  transferUtxoValue,
}: TransferEstimateResult['valueBreakdown']) => {
  const txFee = new BigNumber(commitChainFee).plus(revealChainFee).plus(transferChainFee);
  const inscriptionFee = new BigNumber(revealServiceFee);
  const totalFee = new BigNumber(txFee).plus(inscriptionFee);

  return { txFee, inscriptionFee, totalFee, transferUtxoValue: new BigNumber(transferUtxoValue) };
};
