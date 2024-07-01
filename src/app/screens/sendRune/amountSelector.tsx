import useCoinRates from '@hooks/queries/useCoinRates';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useWalletSelector from '@hooks/useWalletSelector';
import RuneAmountSelector from '@screens/sendRune/runeAmountSelector';
import { FungibleToken, getBtcFiatEquivalent } from '@secretkeylabs/xverse-core';
import SelectFeeRate from '@ui-components/selectFeeRate';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import { getFtBalance } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
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
  token: FungibleToken;
  amountToSend: string;
  setAmountToSend: (amount: string) => void;
  amountError: string;
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
  token,
  amountToSend,
  setAmountToSend,
  amountError,
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
  const { fiatCurrency } = useWalletSelector();
  const { btcFiatRate } = useCoinRates();
  const { data: recommendedFees } = useBtcFeeRate();

  const balance = getFtBalance(token);

  const satsToFiat = (sats: string) =>
    getBtcFiatEquivalent(new BigNumber(sats), BigNumber(btcFiatRate)).toString();

  const amountIsPositiveNumber =
    amountToSend !== '' && !Number.isNaN(Number(amountToSend)) && +amountToSend > 0;

  const isSendButtonEnabled = amountIsPositiveNumber && +amountToSend <= +balance;

  return (
    <Container>
      <div>
        {header}
        <RuneAmountSelector
          token={token}
          amountToSend={amountToSend}
          setAmountToSend={setAmountToSend}
          amountError={amountError}
          sendMax={sendMax}
          setSendMax={setSendMax}
        />
        <FeeRateContainer>
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
        {sendMax && dustFiltered && <Callout bodyText={t('BTC.MAX_IGNORING_DUST_UTXO_MSG')} />}
      </div>
      <Buttons>
        <Button
          title={
            !hasSufficientFunds && amountIsPositiveNumber ? t('INSUFFICIENT_FUNDS') : t('NEXT')
          }
          onClick={onNext}
          loading={isLoading}
          disabled={!hasSufficientFunds || !isSendButtonEnabled}
          variant={!hasSufficientFunds && amountIsPositiveNumber ? 'danger' : undefined}
        />
      </Buttons>
    </Container>
  );
}

export default AmountSelector;
