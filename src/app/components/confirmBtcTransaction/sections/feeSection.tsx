import TransferFeeView from '@components/transferFeeView';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  btcTransaction,
  getBtcFiatEquivalent,
  type RareSatsType,
} from '@secretkeylabs/xverse-core';
import SelectFeeRate from '@ui-components/selectFeeRate';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useTxSummaryContext } from '../hooks/useTxSummaryContext';
import AmountWithInscriptionSatribute from '../itemRow/amountWithInscriptionSatribute';

const Container = styled.div((props) => ({
  background: props.theme.colors.elevation1,
  borderRadius: props.theme.radius(2),
  padding: props.theme.space.m,
  paddingBottom: 20,
  marginBottom: props.theme.space.s,
}));

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
  onShowInscription: (
    inscription:
      | (btcTransaction.IOInscription & { satributes: RareSatsType[] })
      | (Omit<btcTransaction.IOInscription, 'offset'> & { satributes: RareSatsType[] }),
  ) => void;
};

function FeeSection({
  feeRate,
  getFeeForFeeRate,
  onFeeRateSet,
  isSubmitting,
  onShowInscription,
}: Props) {
  const { fiatCurrency } = useWalletSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { t: tUnits } = useTranslation('translation', { keyPrefix: 'UNITS' });
  const { data: recommendedFees } = useBtcFeeRate();
  const { btcFiatRate } = useSupportedCoinRates();

  const { extractedTxSummary } = useTxSummaryContext();

  const isUserSummary = extractedTxSummary.type === 'user';
  const fees = isUserSummary ? extractedTxSummary.feeOutput.amount : extractedTxSummary.fee ?? 0;
  const showFeeSelector = !!(feeRate && getFeeForFeeRate && onFeeRateSet);

  const satsToFiat = (sats: string): string =>
    getBtcFiatEquivalent(new BigNumber(sats), new BigNumber(btcFiatRate)).toString();

  if (showFeeSelector && recommendedFees) {
    return (
      <>
        <Subtitle>{t('FEES')}</Subtitle>
        <Container>
          <SelectFeeRate
            fee={fees.toString()}
            feeUnits="sats"
            feeRate={String(feeRate)}
            feeRateUnits={tUnits('SATS_PER_VB')}
            setFeeRate={(newFeeRate) => onFeeRateSet(+newFeeRate)}
            baseToFiat={satsToFiat}
            fiatUnit={fiatCurrency}
            getFeeForFeeRate={getFeeForFeeRate}
            feeRates={{
              medium: recommendedFees.regular,
              high: recommendedFees.priority,
            }}
            feeRateLimits={recommendedFees.limits}
            isLoading={isSubmitting}
          />
          <AmountWithInscriptionSatribute
            inscriptions={isUserSummary ? extractedTxSummary.feeOutput.inscriptions : []}
            satributes={isUserSummary ? extractedTxSummary.feeOutput.satributes : []}
            onShowInscription={onShowInscription}
          />
        </Container>
      </>
    );
  }

  if (!showFeeSelector && fees > 0) {
    return (
      <TransferFeeView
        fee={new BigNumber(fees)}
        currency={t('SATS')}
        satributes={isUserSummary ? extractedTxSummary.feeOutput.satributes : []}
        inscriptions={isUserSummary ? extractedTxSummary.feeOutput.inscriptions : []}
        onShowInscription={onShowInscription}
      />
    );
  }

  return null;
}

export default FeeSection;
