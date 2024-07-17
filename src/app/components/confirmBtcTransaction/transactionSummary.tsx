import TransactionDetailComponent from '@components/transactionDetailComponent';
import useWalletSelector from '@hooks/useWalletSelector';

import AssetModal from '@components/assetModal';
import BurnSection from '@components/confirmBtcTransaction/burnSection';
import MintSection from '@components/confirmBtcTransaction/mintSection';
import TransferFeeView from '@components/transferFeeView';
import useCoinRates from '@hooks/queries/useCoinRates';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useSelectedAccount from '@hooks/useSelectedAccount';
import {
  btcTransaction,
  getBtcFiatEquivalent,
  RuneSummary,
  RuneSummaryActions,
} from '@secretkeylabs/xverse-core';
import SelectFeeRate from '@ui-components/selectFeeRate';
import Callout from '@ui-library/callout';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import DelegateSection from './delegateSection';
import EtchSection from './etchSection';
import AmountWithInscriptionSatribute from './itemRow/amountWithInscriptionSatribute';
import ReceiveSection from './receiveSection';
import TransferSection from './transferSection';
import TxInOutput from './txInOutput/txInOutput';
import { getNetAmount, isScriptOutput } from './utils';

const Container = styled.div((props) => ({
  background: props.theme.colors.elevation1,
  borderRadius: props.theme.radius(2),
  padding: props.theme.space.m,
  paddingBottom: 20,
  marginBottom: props.theme.space.s,
}));

const WarningCallout = styled(Callout)`
  margin-bottom: ${(props) => props.theme.space.m};
`;

const Subtitle = styled.p`
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_200};
  margin-top: ${(props) => props.theme.space.s};
  margin-bottom: ${(props) => props.theme.space.xs};
`;

type Props = {
  transactionIsFinal: boolean;
  showCenotaphCallout: boolean;
  inputs: btcTransaction.EnhancedInput[];
  outputs: btcTransaction.EnhancedOutput[];
  feeOutput?: btcTransaction.TransactionFeeOutput;
  runeSummary?: RuneSummaryActions | RuneSummary;
  getFeeForFeeRate?: (
    feeRate: number,
    useEffectiveFeeRate?: boolean,
  ) => Promise<number | undefined>;
  onFeeRateSet?: (feeRate: number) => void;
  feeRate?: number;
  isSubmitting?: boolean;
};

function TransactionSummary({
  transactionIsFinal,
  showCenotaphCallout,
  inputs,
  outputs,
  feeOutput,
  runeSummary,
  isSubmitting,
  getFeeForFeeRate,
  onFeeRateSet,
  feeRate,
}: Props) {
  const [inscriptionToShow, setInscriptionToShow] = useState<
    btcTransaction.IOInscription | undefined
  >(undefined);

  const { btcFiatRate } = useCoinRates();
  const { network, fiatCurrency } = useWalletSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { t: tUnits } = useTranslation('translation', { keyPrefix: 'UNITS' });

  const { btcAddress, ordinalsAddress } = useSelectedAccount();
  const { data: recommendedFees } = useBtcFeeRate();

  const hasOutputScript = outputs.some((output) => isScriptOutput(output));

  // TODO - move logic into core
  const hasExternalInputs = inputs.some(
    (input) =>
      input.extendedUtxo.address !== btcAddress && input.extendedUtxo.address !== ordinalsAddress,
  );

  const netAmount = getNetAmount({
    inputs,
    outputs,
    btcAddress,
    ordinalsAddress,
  });

  const isUnConfirmedInput = inputs.some(
    (input) => !input.extendedUtxo.utxo.status.confirmed && input.walletWillSign,
  );

  const satsToFiat = (sats: string) =>
    getBtcFiatEquivalent(new BigNumber(sats), new BigNumber(btcFiatRate)).toString();

  const showFeeSelector = !!(feeRate && getFeeForFeeRate && onFeeRateSet);

  const hasRuneDelegation = !transactionIsFinal;

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
      {isUnConfirmedInput && (
        <WarningCallout bodyText={t('UNCONFIRMED_UTXO_WARNING')} variant="warning" />
      )}
      {showCenotaphCallout && (
        <WarningCallout variant="danger" bodyText={t('RUNES_CENOTAPH_WARNING')} />
      )}
      {runeSummary?.mint && !runeSummary?.mint?.runeIsOpen && (
        <WarningCallout bodyText={t('RUNE_TERM_ENDED')} variant="danger" />
      )}
      {runeSummary?.mint && !runeSummary?.mint?.runeIsMintable && (
        <WarningCallout bodyText={t('RUNE_IS_CLOSED')} variant="danger" />
      )}
      {hasRuneDelegation && <DelegateSection delegations={runeSummary?.transfers} />}
      <TransferSection
        outputs={outputs}
        inputs={inputs}
        hasExternalInputs={hasExternalInputs}
        transactionIsFinal={transactionIsFinal}
        runeTransfers={runeSummary?.transfers}
        onShowInscription={setInscriptionToShow}
        netAmount={-netAmount}
      />
      <ReceiveSection
        outputs={outputs}
        hasExternalInputs={hasExternalInputs}
        transactionIsFinal={transactionIsFinal}
        onShowInscription={setInscriptionToShow}
        netAmount={netAmount}
        runeReceipts={runeSummary?.receipts}
      />
      {!hasRuneDelegation && <BurnSection burns={runeSummary?.burns} />}
      <MintSection mints={[runeSummary?.mint]} />
      <EtchSection etch={(runeSummary as RuneSummaryActions)?.etch} />

      <Subtitle>{t('TRANSACTION_DETAILS')}</Subtitle>

      <TransactionDetailComponent title={t('NETWORK')} value={network.type} />
      <TxInOutput inputs={inputs} outputs={outputs} />
      {hasOutputScript && !runeSummary && <WarningCallout bodyText={t('SCRIPT_OUTPUT_TX')} />}
      {feeOutput && !showFeeSelector && (
        <TransferFeeView
          fee={new BigNumber(feeOutput.amount)}
          currency={t('SATS')}
          satributes={feeOutput.satributes}
          inscriptions={feeOutput.inscriptions}
          onShowInscription={setInscriptionToShow}
        />
      )}
      {feeOutput && showFeeSelector && (
        <>
          <Subtitle>{t('FEES')}</Subtitle>
          <Container>
            <SelectFeeRate
              fee={feeOutput.amount.toString()}
              feeUnits="sats"
              feeRate={feeRate.toString()}
              feeRateUnits={tUnits('SATS_PER_VB')}
              setFeeRate={(newFeeRate) => onFeeRateSet(+newFeeRate)}
              baseToFiat={satsToFiat}
              fiatUnit={fiatCurrency}
              getFeeForFeeRate={getFeeForFeeRate}
              feeRates={{
                medium: recommendedFees?.regular,
                high: recommendedFees?.priority,
              }}
              feeRateLimits={recommendedFees?.limits}
              isLoading={isSubmitting}
            />
            <AmountWithInscriptionSatribute
              inscriptions={feeOutput.inscriptions}
              satributes={feeOutput.satributes}
              onShowInscription={setInscriptionToShow}
            />
          </Container>
        </>
      )}
    </>
  );
}

export default TransactionSummary;
