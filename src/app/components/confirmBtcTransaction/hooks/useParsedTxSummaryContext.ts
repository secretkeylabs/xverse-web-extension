import {
  getInputsWithAssetsFromUserAddress,
  getNetAmount,
  getOutputsWithAssetsFromUserAddress,
  getOutputsWithAssetsToUserAddress,
  isScriptOutput,
} from '@components/confirmBtcTransaction/utils';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import type { TransactionSummary } from '@screens/sendBtc/helpers';
import {
  type Brc20Definition,
  type btcTransaction,
  type RuneSummary,
  type RuneSummaryActions,
} from '@secretkeylabs/xverse-core';
import { createContext, useContext } from 'react';
import type { Color } from 'theme';

export type ParsedTxSummaryContextProps = {
  summary?: TransactionSummary | btcTransaction.PsbtSummary;
  runeSummary?: RuneSummary | RuneSummaryActions;
  brc20Summary?: Brc20Definition & { status: string; statusColor: Color };
};

export const ParsedTxSummaryContext = createContext<ParsedTxSummaryContextProps>({
  summary: undefined,
  runeSummary: undefined,
  brc20Summary: undefined,
});

type BundledOutputs = Record<
  string,
  {
    outputs: (btcTransaction.TransactionOutput | btcTransaction.TransactionPubKeyOutput)[];
    netBtcAmount: number;
    runeTransfers: RuneSummary['transfers'];
  }
>;

export const useParsedTxSummaryContext = (): {
  summary:
    | (TransactionSummary & { dustFiltered?: boolean })
    | btcTransaction.PsbtSummary
    | undefined;
  runeSummary: RuneSummary | RuneSummaryActions | undefined;
  brc20Summary: (Brc20Definition & { status: string; statusColor: Color }) | undefined;
  hasExternalInputs: boolean;
  isUnconfirmedInput: boolean;
  showCenotaphCallout: boolean;
  netBtcAmount: number;
  hasInsufficientRunes: boolean;
  hasSigHashSingle: boolean;
  transactionIsFinal: boolean;
  hasOutputScript: boolean;
  hasSigHashNone: boolean;
  validMintingRune: undefined | boolean;
  showSendSection: boolean;
  showTransferSection: boolean;
  showReceiveSection: boolean;
  sendSection: {
    bundledOutputs: BundledOutputs;
    inscriptionsFromPayment: btcTransaction.IOInscription[];
    satributesFromPayment: btcTransaction.IOSatribute[];
  };
  transferSection: {
    showBtcAmount: boolean;
    showRuneTransfers: boolean;
    outputsFromOrdinal: (
      | btcTransaction.TransactionOutput
      | btcTransaction.TransactionPubKeyOutput
    )[];
    inputsFromOrdinal: btcTransaction.EnhancedInput[];
    inscriptionsFromPayment: btcTransaction.IOInscription[];
    satributesFromPayment: btcTransaction.IOSatribute[];
  };
  receiveSection: {
    showBtcAmount: boolean;
    showOrdinalSection: boolean;
    showPaymentSection: boolean;
    outputsToOrdinal: btcTransaction.TransactionOutput[];
    showPaymentRunes: boolean;
    ordinalRuneReceipts: RuneSummary['receipts'];
    inscriptionsRareSatsInPayment: btcTransaction.TransactionOutput[];
    outputsToPayment: btcTransaction.TransactionOutput[];
    showOrdinalRunes: boolean;
    paymentRuneReceipts: RuneSummary['receipts'];
  };
} => {
  const { summary, runeSummary, brc20Summary } = useContext(ParsedTxSummaryContext);
  const { btcAddress, ordinalsAddress } = useSelectedAccount();
  const { hasActivatedRareSatsKey } = useWalletSelector();
  const showCenotaphCallout = !!summary?.runeOp?.Cenotaph?.flaws;
  const hasInsufficientRunes =
    runeSummary?.transfers?.some((transfer) => !transfer.hasSufficientBalance) ?? false;
  const validMintingRune =
    !runeSummary?.mint ||
    (runeSummary?.mint && runeSummary.mint.runeIsOpen && runeSummary.mint.runeIsMintable);
  const hasOutputScript = summary?.outputs.some((output) => isScriptOutput(output)) ?? false;
  const hasExternalInputs =
    summary?.inputs.some(
      (input) =>
        input.extendedUtxo.address !== btcAddress && input.extendedUtxo.address !== ordinalsAddress,
    ) ?? false;
  const isUnconfirmedInput =
    summary?.inputs.some(
      (input) => !input.extendedUtxo.utxo.status.confirmed && input.walletWillSign,
    ) ?? false;

  // defaults for non-psbt transactions
  const transactionIsFinal = (summary as btcTransaction.PsbtSummary)?.isFinal ?? true;
  const hasSigHashNone = (summary as btcTransaction.PsbtSummary)?.hasSigHashNone ?? false;
  const hasSigHashSingle = (summary as btcTransaction.PsbtSummary)?.hasSigHashSingle ?? false;

  const netBtcAmount = getNetAmount({
    inputs: summary?.inputs,
    outputs: summary?.outputs,
    btcAddress,
    ordinalsAddress,
  });

  /* Send/Transfer Section */

  const { inputsFromPayment, inputsFromOrdinal } = getInputsWithAssetsFromUserAddress({
    inputs: summary?.inputs,
    btcAddress,
    ordinalsAddress,
  });

  const { outputsFromPayment, outputsFromOrdinal } = getOutputsWithAssetsFromUserAddress({
    outputs: summary?.outputs,
    btcAddress,
    ordinalsAddress,
  });

  const showSendBtc = netBtcAmount < 0;
  // if transaction is not final, then runes will be delegated and will show up in the delegation section
  const showRuneTransfers = transactionIsFinal && (runeSummary?.transfers ?? []).length > 0;
  const hasInscriptionsRareSatsInOrdinal =
    (!transactionIsFinal && inputsFromOrdinal.length > 0) || outputsFromOrdinal.length > 0;

  const showSendOrTransfer = showSendBtc || showRuneTransfers || hasInscriptionsRareSatsInOrdinal;
  const showSendSection = showSendOrTransfer && transactionIsFinal && !hasExternalInputs;
  const showTransferSection = showSendOrTransfer && (!transactionIsFinal || hasExternalInputs);

  const bundledOutputs: BundledOutputs = {};
  if (showSendSection) {
    summary?.outputs.forEach((output) => {
      if (output.type === 'script') return;
      let destinationKey: string;
      if (output.type === 'address') {
        if ([ordinalsAddress, btcAddress].includes(output.address)) return; // ignore outputs to own address
        destinationKey = output.address;
      } else {
        // TODO - we can have different destinations of the same type
        destinationKey = output.type;
      }
      bundledOutputs[destinationKey] ||= {
        outputs: [],
        netBtcAmount: 0,
        runeTransfers: [],
      };
      if (output.inscriptions.length || (output.satributes.length && hasActivatedRareSatsKey)) {
        bundledOutputs[destinationKey].outputs =
          bundledOutputs[destinationKey].outputs.concat(output);
      } else {
        bundledOutputs[destinationKey].netBtcAmount += output.amount;
      }
    });
    runeSummary?.transfers.forEach((runeTransfer) => {
      const outputAddress = runeTransfer.destinationAddresses[0];
      if (bundledOutputs[outputAddress]) {
        bundledOutputs[outputAddress].runeTransfers =
          bundledOutputs[outputAddress].runeTransfers.concat(runeTransfer);
      }
    });
  }
  // TODO move to utils
  const inscriptionsFromPayment: btcTransaction.IOInscription[] = [];
  const satributesFromPayment: btcTransaction.IOSatribute[] = [];
  (transactionIsFinal ? outputsFromPayment : inputsFromPayment).forEach(
    (
      item:
        | btcTransaction.EnhancedInput
        | btcTransaction.TransactionOutput
        | btcTransaction.TransactionPubKeyOutput,
    ) => {
      inscriptionsFromPayment.push(...item.inscriptions);
      satributesFromPayment.push(...item.satributes);
    },
  );

  /* Receive section */

  const { outputsToPayment, outputsToOrdinal } = getOutputsWithAssetsToUserAddress({
    outputs: summary?.outputs,
    btcAddress,
    ordinalsAddress,
  });

  // if receiving runes from own addresses, hide it because it is change, unless it swap addresses (recover runes)
  const filteredRuneReceipts: RuneSummary['receipts'] =
    runeSummary?.receipts?.filter(
      (receipt) =>
        !receipt.sourceAddresses.some(
          (address) =>
            (address === ordinalsAddress && receipt.destinationAddress === ordinalsAddress) ||
            (address === btcAddress && receipt.destinationAddress === btcAddress),
        ),
    ) ?? [];
  const ordinalRuneReceipts = filteredRuneReceipts.filter(
    (receipt) => receipt.destinationAddress === ordinalsAddress,
  );
  const paymentRuneReceipts = filteredRuneReceipts.filter(
    (receipt) => receipt.destinationAddress === btcAddress,
  );

  const inscriptionsRareSatsInPayment = outputsToPayment.filter(
    (output) =>
      output.inscriptions.length > 0 || (hasActivatedRareSatsKey && output.satributes.length > 0),
  );

  // if transaction is not final, then runes will be delegated and will show up in the delegation section
  const showOrdinalRunes = !!(transactionIsFinal && ordinalRuneReceipts.length);

  // if transaction is not final, then runes will be delegated and will show up in the delegation section
  const showPaymentRunes = !!(transactionIsFinal && paymentRuneReceipts.length);

  const showReceiveBtc = netBtcAmount > 0;
  const showOrdinalSection = showOrdinalRunes || outputsToOrdinal.length > 0;
  const showPaymentSection =
    showReceiveBtc || showPaymentRunes || inscriptionsRareSatsInPayment.length > 0;
  const showReceiveSection = showOrdinalSection || showPaymentSection;

  return {
    summary,
    runeSummary,
    brc20Summary,
    hasExternalInputs,
    hasInsufficientRunes,
    hasOutputScript,
    hasSigHashNone,
    hasSigHashSingle,
    isUnconfirmedInput,
    netBtcAmount,
    showCenotaphCallout,
    transactionIsFinal,
    validMintingRune,
    showSendSection,
    showTransferSection,
    showReceiveSection,
    sendSection: {
      bundledOutputs,
      inscriptionsFromPayment,
      satributesFromPayment,
    },
    transferSection: {
      showBtcAmount: showSendBtc,
      showRuneTransfers,
      inputsFromOrdinal,
      outputsFromOrdinal,
      inscriptionsFromPayment,
      satributesFromPayment,
    },
    receiveSection: {
      showOrdinalSection,
      showPaymentSection,
      showBtcAmount: showReceiveBtc,
      inscriptionsRareSatsInPayment,
      ordinalRuneReceipts,
      outputsToOrdinal,
      outputsToPayment,
      paymentRuneReceipts,
      showOrdinalRunes,
      showPaymentRunes,
    },
  };
};
