import {
  brc20TransferEstimateFees,
  FungibleToken,
  NetworkType,
  UTXO,
} from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';

export type TransferEstimateResult = Awaited<ReturnType<typeof brc20TransferEstimateFees>>;

export type Brc20TransferEstimateFeesParams = {
  addressUtxos: UTXO[];
  tick: string;
  amount: number;
  feeRate: number;
  revealAddress: string;
  network: NetworkType;
};

export type SendBrc20TransferState = {
  fungibleToken: FungibleToken;
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
