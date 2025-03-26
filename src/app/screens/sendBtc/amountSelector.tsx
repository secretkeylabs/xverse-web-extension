import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useBtcAddressBalance from '@hooks/useBtcAddressBalance';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  AnalyticsEvents,
  getBtcFiatEquivalent,
  type BtcPaymentType,
} from '@secretkeylabs/xverse-core';
import BtcAmountSelector from '@ui-components/btcAmountSelector';
import SelectFeeRate from '@ui-components/selectFeeRate';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import { trackMixPanel } from '@utils/mixpanel';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Title from './title';

const Container = styled.div`
  flex: 1 1 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const FeeRateContainer = styled.div`
  margin-top: ${(props) => props.theme.space.l};
  margin-bottom: ${(props) => props.theme.space.m};
`;

const Buttons = styled.div`
  margin: ${(props) => props.theme.space.l} 0;
`;

type Props = {
  amountSats: string;
  overridePaymentType: BtcPaymentType;
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
  overridePaymentType,
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
  const { t: tUnits } = useTranslation('translation', { keyPrefix: 'UNITS' });
  const navigate = useNavigate();

  const { fiatCurrency } = useWalletSelector();
  const selectedAccount = useSelectedAccount(overridePaymentType);
  const { data: btcBalance, isLoading: btcBalanceLoading } = useBtcAddressBalance(
    selectedAccount.btcAddress,
  );
  const { btcFiatRate } = useSupportedCoinRates();

  const { data: recommendedFees } = useBtcFeeRate();

  const satsToFiat = (sats: string) =>
    getBtcFiatEquivalent(new BigNumber(sats), BigNumber(btcFiatRate)).toString();

  if (btcBalanceLoading || btcBalance === undefined) {
    return null;
  }

  const hasBtc = (btcBalance?.confirmedBalance ?? 0) > 0;
  return (
    <Container>
      <div>
        <Title title={t('SEND')} showBtcIcon />
        <BtcAmountSelector
          data-testid="test-container"
          amountSats={amountSats}
          setAmountSats={setAmountSats}
          sendMax={sendMax}
          setSendMax={setSendMax}
          overridePaymentType={overridePaymentType}
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
              trackMixPanel(AnalyticsEvents.InitiateBuyFlow, {
                selectedToken: 'BTC',
                source: 'send_btc',
              });
              navigate('/buy/BTC');
            }}
          />
        )}
      </Buttons>
    </Container>
  );
}

export default AmountSelector;
