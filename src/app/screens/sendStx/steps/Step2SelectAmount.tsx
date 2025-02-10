import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  AnalyticsEvents,
  getStxFiatEquivalent,
  microstacksToStx,
  stxToMicrostacks,
  type FungibleToken,
} from '@secretkeylabs/xverse-core';
import SelectFeeRate, { type FeeRates } from '@ui-components/selectFeeRate';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import { trackMixPanel } from '@utils/mixpanel';
import { getFtBalance } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import FtAmountSelector from '../ftAmountSelector';
import StxAmountSelector from '../stxAmountSelector';

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
  amount: string;
  setAmount: (amount: string) => void;
  sendMax: boolean;
  setSendMax: (sendMax: boolean) => void;
  fee: string;
  setFee: (fee: string) => void;
  feeRates: FeeRates;
  getFeeForFeeRate: (feeRate: number, useEffectiveFeeRate?: boolean) => Promise<number | undefined>;
  onNext: () => void;
  dustFiltered: boolean;
  isLoading?: boolean;
  header?: React.ReactNode;
  fungibleToken?: FungibleToken;
};

function Step2SelectAmount({
  amount,
  setAmount,
  setFee,
  sendMax,
  setSendMax,
  fee,
  feeRates,
  getFeeForFeeRate,
  onNext,
  isLoading,
  dustFiltered,
  header,
  fungibleToken,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();

  const { fiatCurrency, feeMultipliers } = useWalletSelector();
  const { data: stxData } = useStxWalletData();
  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();
  const stxBalance = stxData?.availableBalance.toString() ?? '0';
  const ftBalance = fungibleToken ? getFtBalance(fungibleToken) : '0';

  const stxToFiat = (stx: string) =>
    getStxFiatEquivalent(
      stxToMicrostacks(new BigNumber(stx)),
      new BigNumber(stxBtcRate),
      new BigNumber(btcFiatRate),
    ).toString();

  const hasStx = +stxBalance > 0;

  let hasInsufficientFunds =
    amount &&
    new BigNumber(stxBalance).isLessThan(
      new BigNumber(amount).plus(stxToMicrostacks(new BigNumber(fee ?? 0))),
    );

  if (fungibleToken) {
    hasInsufficientFunds =
      amount &&
      (new BigNumber(ftBalance).isLessThan(new BigNumber(amount)) ||
        new BigNumber(stxBalance).isLessThan(stxToMicrostacks(new BigNumber(fee ?? 0))));
  }

  useEffect(() => {
    if (sendMax) {
      const newAmount = fungibleToken
        ? new BigNumber(ftBalance)
        : new BigNumber(stxBalance).minus(stxToMicrostacks(new BigNumber(fee ?? 0)));

      if (newAmount.isGreaterThan(new BigNumber(0))) {
        setAmount(newAmount.toString());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendMax, fee]);

  return (
    <Container>
      <div>
        {header}
        {fungibleToken ? (
          <FtAmountSelector
            amount={amount}
            setAmount={setAmount}
            sendMax={sendMax}
            setSendMax={setSendMax}
            disabled={!hasStx}
            fungibleToken={fungibleToken}
          />
        ) : (
          <StxAmountSelector
            amount={amount}
            setAmount={setAmount}
            sendMax={sendMax}
            setSendMax={setSendMax}
            disabled={!hasStx}
          />
        )}
        {hasStx && (
          <FeeRateContainer>
            <SelectFeeRate
              fee={fee}
              feeRate={fee}
              feeUnits="STX"
              setFeeRate={setFee}
              baseToFiat={stxToFiat}
              fiatUnit={fiatCurrency}
              getFeeForFeeRate={getFeeForFeeRate}
              feeRates={feeRates}
              feeRateLimits={{ min: 0.000001, max: feeMultipliers?.thresholdHighStacksFee }}
              isLoading={isLoading}
              absoluteBalance={Number(microstacksToStx(new BigNumber(stxBalance)))}
              amount={Number(amount)}
            />
          </FeeRateContainer>
        )}
        {sendMax && dustFiltered && <Callout bodyText={t('BTC.MAX_IGNORING_DUST_UTXO_MSG')} />}
      </div>
      <Buttons>
        {hasStx && (
          <Button
            title={hasInsufficientFunds ? t('INSUFFICIENT_FUNDS') : t('NEXT')}
            onClick={onNext}
            loading={isLoading}
            disabled={hasInsufficientFunds || +amount === 0}
            variant={hasInsufficientFunds ? 'danger' : 'primary'}
          />
        )}
        {!hasStx && (
          <Callout
            dataTestID="no-funds-message"
            titleText={t('BTC.NO_FUNDS_TITLE')}
            bodyText={t('BTC.NO_FUNDS')}
            redirectText={t('STX.BUY_STX')}
            onClickRedirect={() => {
              trackMixPanel(AnalyticsEvents.InitiateBuyFlow, {
                selectedToken: 'STX',
                source: 'send_stx',
              });
              navigate('/buy/STX');
            }}
          />
        )}
      </Buttons>
    </Container>
  );
}

export default Step2SelectAmount;
