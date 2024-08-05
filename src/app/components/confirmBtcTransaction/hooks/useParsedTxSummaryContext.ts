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
  sendSection: {
    showSendSection: boolean;
    showBtcAmount: boolean;
    showRuneTransfers: boolean;
    hasInscriptionsRareSatsInOrdinal: boolean;
    outputsFromOrdinal: (
      | btcTransaction.TransactionOutput
      | btcTransaction.TransactionPubKeyOutput
    )[];
    inputFromOrdinal: btcTransaction.EnhancedInput[];
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

  const netBtcAmount = getNetAmount({
    inputs: summary?.inputs,
    outputs: summary?.outputs,
    btcAddress,
    ordinalsAddress,
  });

  // defaults for non-psbt transactions
  const transactionIsFinal = (summary as btcTransaction.PsbtSummary)?.isFinal ?? true;
  const hasSigHashNone = (summary as btcTransaction.PsbtSummary)?.hasSigHashNone ?? false;
  const hasSigHashSingle = (summary as btcTransaction.PsbtSummary)?.hasSigHashSingle ?? false;

  /* Send/Transfer section */

  const { inputFromPayment, inputFromOrdinal } = getInputsWithAssetsFromUserAddress({
    inputs: summary?.inputs,
    btcAddress,
    ordinalsAddress,
  });

  const { outputsFromPayment, outputsFromOrdinal } = getOutputsWithAssetsFromUserAddress({
    outputs: summary?.outputs,
    btcAddress,
    ordinalsAddress,
  });

  // TODO move to utils
  const inscriptionsFromPayment: btcTransaction.IOInscription[] = [];
  const satributesFromPayment: btcTransaction.IOSatribute[] = [];
  (transactionIsFinal ? outputsFromPayment : inputFromPayment).forEach(
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

  const showSendBtcAmount = netBtcAmount < 0;

  // if transaction is not final, then runes will be delegated and will show up in the delegation section
  const showRuneTransfers = transactionIsFinal && (runeSummary?.transfers ?? []).length > 0;

  const hasInscriptionsRareSatsInOrdinal =
    (!transactionIsFinal && inputFromOrdinal.length > 0) || outputsFromOrdinal.length > 0;

  /* Receive section */

  const showReceiveBtcAmount = netBtcAmount > 0;
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
    sendSection: {
      showSendSection: showSendBtcAmount || showRuneTransfers || hasInscriptionsRareSatsInOrdinal,
      showBtcAmount: showSendBtcAmount,
      showRuneTransfers,
      hasInscriptionsRareSatsInOrdinal,
      outputsFromOrdinal,
      inputFromOrdinal,
      inscriptionsFromPayment,
      satributesFromPayment,
    },
    receiveSection: {
      showOrdinalSection: showOrdinalRunes || outputsToOrdinal.length > 0,
      showPaymentSection:
        showReceiveBtcAmount || showPaymentRunes || inscriptionsRareSatsInPayment.length > 0,
      showBtcAmount: showReceiveBtcAmount,
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
