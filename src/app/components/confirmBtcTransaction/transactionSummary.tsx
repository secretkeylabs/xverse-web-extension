import AssetModal from '@components/assetModal';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useWalletSelector from '@hooks/useWalletSelector';
import { btcTransaction, type RareSatsType } from '@secretkeylabs/xverse-core';
import Callout from '@ui-library/callout';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useTxSummaryContext } from './hooks/useTxSummaryContext';
import FeeSection from './sections/feeSection';
import ReceiveSection from './sections/receiveSection';
import BurnSection from './sections/runesSection/burnSection';
import DelegateSection from './sections/runesSection/delegateSection';
import EtchSection from './sections/runesSection/etchSection';
import MintSection from './sections/runesSection/mintSection';
import SendSection from './sections/sendSection';
import TransferSection from './sections/transferSection';
import TxInOutput from './txInOutput';

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
  feeRate?: number;
  getFeeForFeeRate?: (
    feeRate: number,
    useEffectiveFeeRate?: boolean,
  ) => Promise<number | undefined>;
  onFeeRateSet?: (feeRate: number) => void;
  isSubmitting?: boolean;
  hideDetails?: boolean;
};

function TransactionSummary({
  feeRate,
  getFeeForFeeRate,
  onFeeRateSet,
  isSubmitting,
  hideDetails,
}: Props) {
  const [inscriptionToShow, setInscriptionToShow] = useState<
    | (btcTransaction.IOInscription & { satributes: RareSatsType[] })
    | (Omit<btcTransaction.IOInscription, 'offset'> & { satributes: RareSatsType[] })
    | undefined
  >(undefined);

  const { network } = useWalletSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { extractedTxSummary, runeEtchDetails } = useTxSummaryContext();

  const { hasUnconfirmedInputs, hasOutputScript, runes } = extractedTxSummary;
  const { hasCenotaph, mint } = runes;

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
      {hasUnconfirmedInputs && (
        <WarningCallout bodyText={t('UNCONFIRMED_UTXO_WARNING')} variant="warning" />
      )}
      {hasCenotaph && <WarningCallout variant="danger" bodyText={t('RUNES_CENOTAPH_WARNING')} />}
      {mint && !mint.runeIsOpen && (
        <WarningCallout bodyText={t('RUNE_TERM_ENDED')} variant="danger" />
      )}
      {mint && !mint.runeIsMintable && (
        <WarningCallout bodyText={t('RUNE_IS_CLOSED')} variant="danger" />
      )}
      <DelegateSection />
      <SendSection onShowInscription={setInscriptionToShow} />
      <TransferSection onShowInscription={setInscriptionToShow} />
      <ReceiveSection onShowInscription={setInscriptionToShow} />
      <BurnSection />
      <MintSection />
      <EtchSection etch={runeEtchDetails} />
      {!hideDetails && <Subtitle>{t('TRANSACTION_DETAILS')}</Subtitle>}
      <TransactionDetailComponent title={t('NETWORK')} value={network.type} />
      {!hideDetails && (
        <>
          <TxInOutput />
          {hasOutputScript && !runes && <WarningCallout bodyText={t('SCRIPT_OUTPUT_TX')} />}
          <FeeSection
            feeRate={feeRate}
            getFeeForFeeRate={getFeeForFeeRate}
            onFeeRateSet={onFeeRateSet}
            isSubmitting={isSubmitting}
            onShowInscription={setInscriptionToShow}
          />
        </>
      )}
    </>
  );
}

export default TransactionSummary;
