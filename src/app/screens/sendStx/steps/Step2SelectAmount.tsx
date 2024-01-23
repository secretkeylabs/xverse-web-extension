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
import StxAmountSelector from '../stxAmountSelector';

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
  amount: string;
  setAmount: (amount: string) => void;
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

function Step2SelectAmount({
  amount,
  setAmount,
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
  const navigate = useNavigate();

  const { btcFiatRate, fiatCurrency, stxBalance } = useWalletSelector();
  const { data: recommendedFees } = useBtcFeeRate();

  const satsToFiat = (sats: string) =>
    getBtcFiatEquivalent(new BigNumber(sats), BigNumber(btcFiatRate)).toNumber().toFixed(2);

  const hasStx = +stxBalance > 0;
  return (
    <Container>
      <div>
        {header}
        <StxAmountSelector
          amount={amount}
          setAmount={setAmount}
          sendMax={sendMax}
          setSendMax={setSendMax}
          disabled={!hasStx}
        />
        {hasStx && (
          <FeeRateContainer>
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
        {hasStx && (
          <Button
            title={hasSufficientFunds ? t('NEXT') : t('INSUFFICIENT_FUNDS')}
            onClick={onNext}
            loading={isLoading}
            disabled={!hasSufficientFunds || +amount === 0}
            variant={hasSufficientFunds ? undefined : 'danger'}
          />
        )}
        {!hasStx && (
          <Callout
            titleText={t('BTC.NO_FUNDS_TITLE')}
            bodyText={t('BTC.NO_FUNDS')}
            redirectText={t('BTC.BUY_BTC')}
            onClickRedirect={() => {
              navigate('/buy/btc');
            }}
          />
        )}
      </Buttons>
    </Container>
  );
}

export default Step2SelectAmount;
