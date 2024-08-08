import type { btcTransaction, BundleSatRange, FungibleToken } from '@secretkeylabs/xverse-core';

// TODO this should all be in core and unit tested

export type SatRangeTx = {
  totalSats: number;
  offset: number;
  fromAddress: string;
  inscriptions: (Omit<btcTransaction.IOInscription, 'contentType' | 'number'> & {
    content_type: string;
    inscription_number: number;
  })[];
  satributes: btcTransaction.IOSatribute['types'];
};

const DUMMY_OFFSET = -1;

export const isScriptOutput = (
  output: btcTransaction.EnhancedOutput,
): output is btcTransaction.TransactionScriptOutput =>
  (output as btcTransaction.TransactionScriptOutput).script !== undefined;

export const isPubKeyOutput = (
  output: btcTransaction.EnhancedOutput,
): output is btcTransaction.TransactionPubKeyOutput =>
  !!(output as btcTransaction.TransactionPubKeyOutput).pubKeys?.length;

export const isAddressOutput = (
  output: btcTransaction.EnhancedOutput,
): output is btcTransaction.TransactionOutput =>
  (output as btcTransaction.TransactionOutput).address !== undefined;

type CommonInputOutputUtilProps = {
  inputs?: btcTransaction.EnhancedInput[];
  outputs?: btcTransaction.EnhancedOutput[];
  btcAddress: string;
  ordinalsAddress: string;
};

export const getNetAmount = ({
  inputs,
  outputs,
  btcAddress,
  ordinalsAddress,
}: CommonInputOutputUtilProps) => {
  if (!inputs || !outputs) {
    return 0;
  }

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
      isAddressOutput(output) && [btcAddress, ordinalsAddress].includes(output.address);
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
}: Omit<CommonInputOutputUtilProps, 'inputs'>): {
  outputsFromPayment: (btcTransaction.TransactionOutput | btcTransaction.TransactionPubKeyOutput)[];
  outputsFromOrdinal: (btcTransaction.TransactionOutput | btcTransaction.TransactionPubKeyOutput)[];
} => {
  // we want to discard outputs that are script, are not from user address and do not have inscriptions or satributes
  const outputsFromPayment: (
    | btcTransaction.TransactionOutput
    | btcTransaction.TransactionPubKeyOutput
  )[] = [];
  const outputsFromOrdinal: (
    | btcTransaction.TransactionOutput
    | btcTransaction.TransactionPubKeyOutput
  )[] = [];
  outputs?.forEach((output) => {
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
      outputsFromOrdinal.push(output);
    }
    if (itemsFromPayment.length > 0) {
      outputsFromPayment.push(output);
    }
  });

  return { outputsFromPayment, outputsFromOrdinal };
};

export const getInputsWithAssetsFromUserAddress = ({
  btcAddress,
  ordinalsAddress,
  inputs,
}: Omit<CommonInputOutputUtilProps, 'outputs'>): {
  inputsFromPayment: btcTransaction.EnhancedInput[];
  inputsFromOrdinal: btcTransaction.EnhancedInput[];
} => {
  // we want to discard inputs that are not from user address and do not have inscriptions or satributes
  const inputsFromPayment: btcTransaction.EnhancedInput[] = [];
  const inputsFromOrdinal: btcTransaction.EnhancedInput[] = [];
  inputs?.forEach((input) => {
    if (!input.inscriptions.length && !input.satributes.length) {
      return;
    }

    if (input.extendedUtxo.address === btcAddress) {
      return inputsFromPayment.push(input);
    }
    if (input.extendedUtxo.address === ordinalsAddress) {
      inputsFromOrdinal.push(input);
    }
  });

  return { inputsFromPayment, inputsFromOrdinal };
};

export const getOutputsWithAssetsToUserAddress = ({
  btcAddress,
  ordinalsAddress,
  outputs,
}: Omit<CommonInputOutputUtilProps, 'inputs'>): {
  outputsToPayment: btcTransaction.TransactionOutput[];
  outputsToOrdinal: btcTransaction.TransactionOutput[];
} => {
  const outputsToPayment: btcTransaction.TransactionOutput[] = [];
  const outputsToOrdinal: btcTransaction.TransactionOutput[] = [];
  outputs?.forEach((output) => {
    // we want to discard outputs that are not spendable or are not to user address
    if (
      isScriptOutput(output) ||
      isPubKeyOutput(output) ||
      ![btcAddress, ordinalsAddress].includes(output.address)
    ) {
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

export const mapTxSatributeInfoToBundleInfo = (item: btcTransaction.IOSatribute | SatRangeTx) => {
  const commonProps = {
    offset: item.offset,
    block: 0,
    range: {
      start: '0',
      end: '0',
    },
    yearMined: 0,
  };

  // SatRangeTx
  if ('totalSats' in item) {
    return {
      ...commonProps,
      totalSats: item.totalSats,
      inscriptions: item.inscriptions,
      satributes: item.satributes,
    } as BundleSatRange;
  }

  // btcTransaction.IOSatribute
  return {
    ...commonProps,
    totalSats: item.amount,
    inscriptions: [],
    satributes: item.types,
  } as BundleSatRange;
};

export const getSatRangesWithInscriptions = ({
  satributes,
  inscriptions,
  amount,
}: {
  inscriptions: btcTransaction.IOInscription[];
  satributes: btcTransaction.IOSatribute[];
  amount: number;
}) => {
  const satRanges: {
    [offset: number]: SatRangeTx;
  } = {};

  satributes.forEach((satribute) => {
    const { types, amount: totalSats, ...rest } = satribute;
    satRanges[rest.offset] = { ...rest, satributes: types, totalSats, inscriptions: [] };
  });

  inscriptions.forEach((inscription) => {
    const { contentType, number, ...inscriptionRest } = inscription;
    const mappedInscription = {
      ...inscriptionRest,
      content_type: contentType,
      inscription_number: number,
    };
    if (satRanges[inscription.offset]) {
      satRanges[inscription.offset] = {
        ...satRanges[inscription.offset],
        inscriptions: [...satRanges[inscription.offset].inscriptions, mappedInscription],
      };
      return;
    }

    satRanges[inscription.offset] = {
      totalSats: 1,
      offset: inscription.offset,
      fromAddress: inscription.fromAddress,
      inscriptions: [mappedInscription],
      satributes: ['COMMON'],
    };
  });

  const { amountOfExoticsOrInscribedSats, totalExoticSats } = Object.values(satRanges).reduce(
    (acc, range) => ({
      amountOfExoticsOrInscribedSats: acc.amountOfExoticsOrInscribedSats + range.totalSats,
      totalExoticSats:
        acc.totalExoticSats + (!range.satributes.includes('COMMON') ? range.totalSats : 0),
    }),
    {
      amountOfExoticsOrInscribedSats: 0,
      totalExoticSats: 0,
    },
  );

  if (amountOfExoticsOrInscribedSats < amount) {
    satRanges[DUMMY_OFFSET] = {
      totalSats: amount - amountOfExoticsOrInscribedSats,
      offset: DUMMY_OFFSET,
      fromAddress: '',
      inscriptions: [],
      satributes: ['COMMON'],
    };
  }

  // sort should be: inscribed rare, rare, inscribed common, common
  const satRangesArray = Object.values(satRanges).sort((a, b) => {
    // Check conditions for each category
    const aHasInscriptions = a.inscriptions.length > 0;
    const bHasInscriptions = b.inscriptions.length > 0;
    const aHasRareSatributes = a.satributes.some((s) => s !== 'COMMON');
    const bHasRareSatributes = b.satributes.some((s) => s !== 'COMMON');

    // sats not rare and not inscribed at bottom
    if (!aHasInscriptions && !aHasRareSatributes) return 1;

    // sats inscribed and rare at top
    if (aHasInscriptions && aHasRareSatributes) return -1;

    // sats not inscribed and rare below inscribed and rare
    if (bHasInscriptions && bHasRareSatributes) return 1;

    // sats inscribed and not rare above sats not inscribed and not rare
    if (aHasRareSatributes) return -1;
    if (bHasRareSatributes) return 1;

    // equal ranges
    return 0;
  });

  return { satRanges: satRangesArray, totalExoticSats };
};

export const mapRuneNameToPlaceholder = (
  runeName: string,
  symbol: string,
  inscriptionId: string,
): FungibleToken => ({
  protocol: 'runes',
  name: runeName,
  assetName: '',
  balance: '',
  principal: '',
  total_received: '',
  total_sent: '',
  runeSymbol: symbol,
  runeInscriptionId: inscriptionId,
});
