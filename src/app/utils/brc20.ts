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

export const isValidContentType = (contentType: string) =>
  contentType.startsWith('text/plain') || contentType.startsWith('application/json');

export const isValidFields = (
  parsedFields: string[],
  requiredFields: Set<string>,
  optionalFields?: Set<string>,
) =>
  parsedFields.every((f) => requiredFields.has(f) || optionalFields?.has(f)) &&
  [...requiredFields].every((f) => parsedFields.includes(f));

export const isNumber = (value: string) => !Number.isNaN(Number(value));

export type Brc20Definition = {
  op: 'deploy' | 'mint' | 'transfer';
  tick: string;
  value: string;
};

export const getBrc20Details = (
  content: string,
  contentType: string,
): undefined | Brc20Definition => {
  if (!isValidContentType(contentType)) {
    return undefined;
  }

  try {
    const parsedContent = JSON.parse(content);

    if (
      parsedContent.p !== 'brc-20' ||
      !['deploy', 'mint', 'transfer'].includes(parsedContent.op)
    ) {
      return undefined;
    }

    const parsedFields = Object.keys(parsedContent);
    const parsedValues = Object.values(parsedContent);

    if (parsedValues.some((v) => typeof v !== 'string')) {
      return undefined;
    }

    const deployRequiredFields = new Set(['p', 'op', 'tick', 'max']);
    const deployOptionalFields = new Set(['lim', 'desc']);

    const mintRequiredFields = new Set(['p', 'op', 'tick', 'amt']);

    const transferRequiredFields = new Set(['p', 'op', 'tick', 'amt']);

    const isValidDeploy =
      parsedContent.op === 'deploy' &&
      isValidFields(parsedFields, deployRequiredFields, deployOptionalFields) &&
      parsedContent.tick.length === 4 &&
      isNumber(parsedContent.max) &&
      (!parsedContent.lim || isNumber(parsedContent.lim)) &&
      (!parsedContent.desc || typeof parsedContent.desc === 'string');

    const isValidMint =
      parsedContent.op === 'mint' &&
      isValidFields(parsedFields, mintRequiredFields) &&
      parsedContent.tick.length === 4 &&
      isNumber(parsedContent.amt);

    const isValidTransfer =
      parsedContent.op === 'transfer' &&
      isValidFields(parsedFields, transferRequiredFields) &&
      parsedContent.tick.length === 4 &&
      isNumber(parsedContent.amt);

    if (!isValidDeploy && !isValidMint && !isValidTransfer) {
      return undefined;
    }

    return {
      op: parsedContent.op,
      tick: parsedContent.tick.toUpperCase(),
      value: parsedContent.max || parsedContent.amt,
    };
  } catch (e) {
    return undefined;
  }
};
