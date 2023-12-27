import TransactionDetailComponent from '@components/transactionDetailComponent';
import useWalletSelector from '@hooks/useWalletSelector';

import AssetModal from '@components/assetModal';
import TransferFeeView from '@components/transferFeeView';
import { btcTransaction } from '@secretkeylabs/xverse-core';
import Callout from '@ui-library/callout';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ReceiveSection from './receiveSection';
import TransferSection from './transferSection';
import TxInOutput from './txInOutput/txInOutput';
import { getNetAmount, isScriptOutput, isSpendOutput } from './utils';

const ScriptCallout = styled(Callout)`
  margin-bottom: ${(props) => props.theme.space.s};
`;
const InscribedRareSatWarning = styled(Callout)`
  margin-bottom: ${(props) => props.theme.space.m};
`;

const UnconfirmedInputCallout = styled(Callout)`
  margin-bottom: ${(props) => props.theme.space.m};
`;

type Props = {
  isPartialTransaction: boolean;

  inputs: btcTransaction.EnhancedInput[];
  outputs: btcTransaction.EnhancedOutput[];
  feeOutput?: btcTransaction.TransactionFeeOutput;

  // TODO: these are for txn screens which we will tackle next
  // TODO: By having these as generic props here, we can use the generic set fee rate component for all use cases
  getFeeForFeeRate?: (feeRate: number, useEffectiveFeeRate?: boolean) => Promise<number>;
  onFeeRateSet?: (feeRate: number) => void;
  // TODO: use this to disable the edit fee component when it is created
  isSubmitting?: boolean;
};

function TransactionSummary({
  inputs,
  outputs,
  feeOutput,
  isPartialTransaction,
  isSubmitting,
  getFeeForFeeRate,
  onFeeRateSet,
}: Props) {
  const [inscriptionToShow, setInscriptionToShow] = useState<
    btcTransaction.IOInscription | undefined
  >(undefined);

  const { network, selectedAccount } = useWalletSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { t: settingsT } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const { btcAddress, ordinalsAddress } = useWalletSelector();
  const navigate = useNavigate();

  const goToRecoverAssets = async () => {
    if (isLedgerAccount(selectedAccount) && !isInOptions()) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL('options.html#/restore-funds'),
      });
      return;
    }

    navigate('/restore-funds');
  };

  const hasOutputScript = outputs.some((output) => isScriptOutput(output));

  const netAmount = getNetAmount({
    inputs,
    outputs,
    btcAddress,
    ordinalsAddress,
  });

  const isUnConfirmedInput = inputs.some((input) => !input.extendedUtxo.utxo.status.confirmed);

  const paymentHasInscribedRareSats = isPartialTransaction
    ? inputs.some(
        (input) =>
          input.extendedUtxo.address === btcAddress &&
          (input.inscriptions.length || input.satributes.length),
      )
    : outputs.some(
        (output) =>
          isSpendOutput(output) &&
          (output.inscriptions.some((inscription) => inscription.fromAddress === btcAddress) ||
            output.satributes.some((satribute) => satribute.fromAddress === btcAddress)),
      );
  const feesHaveInscribedRareSats = feeOutput?.inscriptions.length || feeOutput?.satributes.length;
  const showInscribeRareSatWarning = paymentHasInscribedRareSats || feesHaveInscribedRareSats;

  return (
    <>
      {inscriptionToShow && (
        <AssetModal
          onClose={() => setInscriptionToShow(undefined)}
          inscription={{
            content_type: inscriptionToShow.contentType,
            id: inscriptionToShow.id,
            inscription_number: inscriptionToShow.number,
          }}
        />
      )}

      {!!showInscribeRareSatWarning && (
        <InscribedRareSatWarning
          variant="warning"
          bodyText={t('INSCRIBED_RARE_SATS_WARNING')}
          redirectText={settingsT('RECOVER_ASSETS')}
          onClickRedirect={goToRecoverAssets}
        />
      )}

      {isUnConfirmedInput && (
        <UnconfirmedInputCallout bodyText={t('UNCONFIRMED_UTXO_WARNING')} variant="warning" />
      )}

      <TransferSection
        outputs={outputs}
        inputs={inputs}
        isPartialTransaction={isPartialTransaction}
        onShowInscription={setInscriptionToShow}
        netAmount={(netAmount + (feeOutput?.amount ?? 0)) * -1}
      />

      <ReceiveSection
        outputs={outputs}
        onShowInscription={setInscriptionToShow}
        netAmount={netAmount}
      />

      <TxInOutput inputs={inputs} outputs={outputs} />

      {hasOutputScript && <ScriptCallout bodyText={t('SCRIPT_OUTPUT_TX')} />}

      <TransactionDetailComponent title={t('NETWORK')} value={network.type} />

      {feeOutput && (
        <TransferFeeView
          fee={new BigNumber(feeOutput.amount)}
          currency={t('SATS')}
          satributes={feeOutput.satributes}
          inscriptions={feeOutput.inscriptions}
          onShowInscription={setInscriptionToShow}
        />
      )}
    </>
  );
}

export default TransactionSummary;
