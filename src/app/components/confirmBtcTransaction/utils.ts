import { btcTransaction } from '@secretkeylabs/xverse-core';

export const isScriptOutput = (
  output: btcTransaction.EnhancedOutput,
): output is btcTransaction.TransactionScriptOutput =>
  (output as btcTransaction.TransactionScriptOutput).script !== undefined;

export const isSpendOutput = (
  output: btcTransaction.EnhancedOutput,
): output is btcTransaction.TransactionOutput =>
  (output as btcTransaction.TransactionOutput).address !== undefined;

type CommonInputOutputUtilProps = {
  inputs: btcTransaction.EnhancedInput[];
  outputs: btcTransaction.EnhancedOutput[];
  btcAddress: string;
  ordinalsAddress: string;
};

export const getNetAmount = ({
  inputs,
  outputs,
  btcAddress,
  ordinalsAddress,
}: CommonInputOutputUtilProps) => {
  const initialValue = 0;

  const totalUserSpend = inputs.reduce((accumulator: number, input) => {
    const isFromUserAddress = [btcAddress, ordinalsAddress].includes(input.extendedUtxo.address);
    if (isFromUserAddress) {
      return accumulator + input.extendedUtxo.utxo.value;
    }
    return accumulator;
  }, initialValue);

  const totalUserReceive = outputs.reduce((accumulator: number, output) => {
    const isToUserAddress =
      isSpendOutput(output) && [btcAddress, ordinalsAddress].includes(output.address);
    if (isToUserAddress) {
      return accumulator + output.amount;
    }
    return accumulator;
  }, initialValue);

  return totalUserReceive - totalUserSpend;
};

export const getOutputsWithAssetsFromUserAddress = ({
  btcAddress,
  ordinalsAddress,
  outputs,
}: Omit<CommonInputOutputUtilProps, 'inputs'>) => {
  // we want to discard outputs that are script, are not from user address and do not have inscriptions or satributes
  const outputsFromPayment: btcTransaction.TransactionOutput[] = [];
  const outputsFromOrdinal: btcTransaction.TransactionOutput[] = [];
  outputs.forEach((output) => {
    if (isScriptOutput(output)) {
      return;
    }

    const itemsFromPayment: (btcTransaction.IOInscription | btcTransaction.IOSatribute)[] = [];
    const itemsFromOrdinal: (btcTransaction.IOInscription | btcTransaction.IOSatribute)[] = [];
    [...output.inscriptions, ...output.satributes].forEach((item) => {
      if (item.fromAddress === btcAddress) {
        return itemsFromPayment.push(item);
      }
      if (item.fromAddress === ordinalsAddress) {
        itemsFromOrdinal.push(item);
      }
    });

    if (itemsFromOrdinal.length > 0) {
      return outputsFromOrdinal.push(output);
    }
    if (itemsFromPayment.length > 0) {
      outputsFromPayment.push(output);
    }
  });

  return { outputsFromPayment, outputsFromOrdinal };
};

export const getInputsWitAssetsFromUserAddress = ({
  btcAddress,
  ordinalsAddress,
  inputs,
}: Omit<CommonInputOutputUtilProps, 'outputs'>) => {
  // we want to discard inputs that are not from user address and do not have inscriptions or satributes
  const inputFromPayment: btcTransaction.EnhancedInput[] = [];
  const inputFromOrdinal: btcTransaction.EnhancedInput[] = [];
  inputs.forEach((input) => {
    if (!input.inscriptions.length && !input.satributes.length) {
      return;
    }

    if (input.extendedUtxo.address === btcAddress) {
      return inputFromPayment.push(input);
    }
    if (input.extendedUtxo.address === ordinalsAddress) {
      inputFromOrdinal.push(input);
    }
  });

  return { inputFromPayment, inputFromOrdinal };
};

export const getOutputsWithAssetsToUserAddress = ({
  btcAddress,
  ordinalsAddress,
  outputs,
}: Omit<CommonInputOutputUtilProps, 'inputs'>) => {
  const outputsToPayment: btcTransaction.TransactionOutput[] = [];
  const outputsToOrdinal: btcTransaction.TransactionOutput[] = [];
  outputs.forEach((output) => {
    // we want to discard outputs that are not spendable or are not to user address
    if (isScriptOutput(output) || ![btcAddress, ordinalsAddress].includes(output.address)) {
      return;
    }

    if (output.address === btcAddress) {
      return outputsToPayment.push(output);
    }

    // we don't want to show amount to ordinals address, because it's not spendable
    if (
      output.address === ordinalsAddress &&
      (output.inscriptions.length > 0 || output.satributes.length > 0)
    ) {
      outputsToOrdinal.push(output);
    }
  });

  return { outputsToPayment, outputsToOrdinal };
};
