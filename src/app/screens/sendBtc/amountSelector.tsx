import useBtcRecommendedFees from '@hooks/useBtcRecommendedFees';
import useWalletSelector from '@hooks/useWalletSelector';
import { getBtcFiatEquivalent } from '@secretkeylabs/xverse-core';
import BtcAmountSelector from '@ui-components/btcAmountSelector';
import SelectFeeRate from '@ui-components/selectFeeRate';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1 1 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Buttons = styled.div`
  margin: ${(props) => props.theme.spacing(12)}px 0;
`;

type Props = {
  amountSats: string;
  setAmountSats: (amount: string) => void;
  feeRate: string;
  setFeeRate: (feeRate: string) => void;
  sendMax: boolean;
  setSendMax: (sendMax: boolean) => void;
  fee: string | undefined;
  getFeeForFeeRate: (feeRate: number, useEffectiveFeeRate?: boolean) => Promise<number | undefined>;
  onNext: () => void;
  dustFiltered: boolean;
  hasSufficientFunds: boolean;
  isLoading?: boolean;
};

function AmountSelector({
  amountSats,
  setAmountSats,
  feeRate,
  setFeeRate,
  sendMax,
  setSendMax,
  fee,
  getFeeForFeeRate,
  onNext,
  isLoading,
  dustFiltered,
  hasSufficientFunds,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { btcFiatRate, fiatCurrency } = useWalletSelector();
  const { data: recommendedFees } = useBtcRecommendedFees();

  const satsToFiat = (sats: string) =>
    getBtcFiatEquivalent(new BigNumber(sats), BigNumber(btcFiatRate)).toNumber().toFixed(2);

  return (
    <Container>
      <div>
        <BtcAmountSelector
          amountSats={amountSats}
          setAmountSats={setAmountSats}
          sendMax={sendMax}
          setSendMax={setSendMax}
          disabled={isLoading}
        />
        <SelectFeeRate
          fee={fee}
          feeUnits="Sats"
          feeRate={feeRate}
          feeRateUnits="sats/vB"
          setFeeRate={setFeeRate}
          baseToFiat={satsToFiat}
          fiatUnit={fiatCurrency}
          getFeeForFeeRate={getFeeForFeeRate}
          feeRates={{
            low: recommendedFees?.halfHourFee,
            medium: recommendedFees?.economyFee,
            high: recommendedFees?.fastestFee,
          }}
          isLoading={isLoading}
        />
        {sendMax && dustFiltered && <Callout bodyText={t('BTC.MAX_IGNORING_DUST_UTXO_MSG')} />}
      </div>
      <Buttons>
        <Button
          title={hasSufficientFunds ? t('NEXT') : t('INSUFFICIENT_FUNDS')}
          onClick={onNext}
          loading={isLoading}
          disabled={!hasSufficientFunds}
          variant={hasSufficientFunds ? undefined : 'danger'}
        />
      </Buttons>
    </Container>
  );
}

export default AmountSelector;
