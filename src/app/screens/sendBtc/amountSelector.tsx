import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useCoinRates from '@hooks/queries/useCoinRates';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useWalletSelector from '@hooks/useWalletSelector';
import { getBtcFiatEquivalent } from '@secretkeylabs/xverse-core';
import BtcAmountSelector from '@ui-components/btcAmountSelector';
import SelectFeeRate from '@ui-components/selectFeeRate';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1 1 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const FeeRateContainer = styled.div`
  margin-top: ${(props) => props.theme.spacing(12)}px;
  margin-bottom: ${(props) => props.theme.spacing(8)}px;
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
  header?: React.ReactNode;
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
  header,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { t: tUnits } = useTranslation('translation', { keyPrefix: 'UNITS' });
  const navigate = useNavigate();

  const { fiatCurrency } = useWalletSelector();
  const { data: btcBalance, isLoading: btcBalanceLoading } = useBtcWalletData();
  const { btcFiatRate } = useCoinRates();

  const { data: recommendedFees } = useBtcFeeRate();

  const satsToFiat = (sats: string) =>
    getBtcFiatEquivalent(new BigNumber(sats), BigNumber(btcFiatRate)).toNumber().toFixed(2);

  if (btcBalanceLoading || btcBalance === undefined) {
    return null;
  }

  const hasBtc = +btcBalance > 0;
  return (
    <Container>
      <div>
        {header}
        <BtcAmountSelector
          data-testid="test-container"
          amountSats={amountSats}
          setAmountSats={setAmountSats}
          sendMax={sendMax}
          setSendMax={setSendMax}
          disabled={!hasBtc}
        />
        {hasBtc && (
          <FeeRateContainer data-testid="feerate-container">
            <SelectFeeRate
              fee={fee}
              feeUnits="sats"
              feeRate={feeRate}
              feeRateUnits={tUnits('SATS_PER_VB')}
              setFeeRate={setFeeRate}
              baseToFiat={satsToFiat}
              fiatUnit={fiatCurrency}
              getFeeForFeeRate={getFeeForFeeRate}
              feeRates={{
                medium: recommendedFees?.regular,
                high: recommendedFees?.priority,
              }}
              feeRateLimits={recommendedFees?.limits}
              isLoading={isLoading}
            />
          </FeeRateContainer>
        )}
        {sendMax && dustFiltered && <Callout bodyText={t('BTC.MAX_IGNORING_DUST_UTXO_MSG')} />}
      </div>
      <Buttons>
        {hasBtc && (
          <Button
            title={hasSufficientFunds ? t('NEXT') : t('INSUFFICIENT_FUNDS')}
            onClick={onNext}
            loading={isLoading}
            disabled={!hasSufficientFunds || +amountSats === 0}
            variant={hasSufficientFunds ? undefined : 'danger'}
          />
        )}
        {!hasBtc && (
          <Callout
            dataTestID="no-funds-message"
            titleText={t('BTC.NO_FUNDS_TITLE')}
            bodyText={t('BTC.NO_FUNDS')}
            redirectText={t('BTC.BUY_BTC')}
            onClickRedirect={() => {
              navigate('/buy/BTC');
            }}
          />
        )}
      </Buttons>
    </Container>
  );
}

export default AmountSelector;
