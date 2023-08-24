import { UTXO, brc20TransferEstimateFees } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';

export type TransferEstimateResult = Awaited<ReturnType<typeof brc20TransferEstimateFees>>;

export type Brc20TransferParams = {
  recipient: string;
  addressUtxos: UTXO[];
  ticker: string;
  amount: number;
  transferFees: TransferEstimateResult;
};

export type Brc20TransactionParams = Omit<Brc20TransferParams, 'transferFees'> & {
  seed: string;
  feeRate: number;
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
  const btcFee = new BigNumber(transferUtxoValue);

  return { txFee, inscriptionFee, totalFee, btcFee };
};
