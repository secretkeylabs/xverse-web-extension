import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowsDownUp } from '@phosphor-icons/react';
import {
  btcToSats,
  getBtcFiatEquivalent,
  getFiatBtcEquivalent,
  satsToBtc,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Input from '@ui-library/input';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1 1 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const BalanceText = styled.span`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_200};
`;

const ConvertComplication = styled.div`
  cursor: pointer;
  user-select: none;

  display: flex;
  align-items: center;
  gap: 2px;
`;

const VertRule = styled.div`
  width: 1px;
  height: 16px;
  background-color: ${(props) => props.theme.colors.white_800};
  margin: 0 8px;
`;

const MaxButton = styled.div<{ $sendMax: boolean }>`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) =>
    props.$sendMax ? props.theme.colors.tangerine : props.theme.colors.tangerine_dark};
  cursor: pointer;
  user-select: none;

  &:hover {
    color: ${(props) => props.theme.colors.tangerine_light};
  }
`;

const inputValidator = /^[0-9.]*$/;
const btcInputExtractor = /[0-9]+[.]?[0-9]{0,8}/;
const btcInputValidator = /^[0-9]+[.]?[0-9]{0,8}$/;
const fiatInputExtractor = /[0-9]+[.]?[0-9]{0,2}/;
const fiatInputValidator = /^[0-9]+[.]?[0-9]{0,2}$/;

type Props = {
  amount: string;
  setAmount: (amount: string) => void;
  feeRate: string;
  setFeeRate: (feeRate: string) => void;
  sendMax: boolean;
  setSendMax: (sendMax: boolean) => void;
  onNext: () => void;
};

function AmountSelector({
  amount,
  setAmount,
  feeRate,
  setFeeRate,
  sendMax,
  setSendMax,
  onNext,
}: Props) {
  BigNumber.config({ EXPONENTIAL_AT: 8 });
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { btcBalance: btcBalanceSats, btcFiatRate, fiatCurrency } = useWalletSelector();

  const [amountDisplay, setAmountDisplay] = useState(amount);
  const [useBtcValue, setUseBtcValue] = useState(true);

  const btcBalance = new BigNumber(btcBalanceSats);
  const balance = useBtcValue
    ? satsToBtc(btcBalance).toString()
    : getBtcFiatEquivalent(btcBalance, new BigNumber(btcFiatRate)).toFixed(2);

  const sendAmountConverted = useBtcValue
    ? getBtcFiatEquivalent(btcToSats(new BigNumber(amount)), BigNumber(btcFiatRate))
        .toNumber()
        .toFixed(2)
    : amount;

  const handleNext = () => {
    // TODO: validate amount
    onNext();
  };

  const handleAmountChange = (newAmount: string) => {
    const isValidInput = inputValidator.test(newAmount);
    if (!isValidInput) return;

    setAmountDisplay(newAmount);

    if (!newAmount) {
      setAmount('0');
      return;
    }

    const isValidAmount = useBtcValue
      ? btcInputValidator.test(newAmount)
      : fiatInputValidator.test(newAmount);

    if (!isValidAmount) return;

    if (useBtcValue) {
      setAmount(newAmount);
    } else {
      const btcAmount = getFiatBtcEquivalent(new BigNumber(newAmount), new BigNumber(btcFiatRate));
      setAmount(btcAmount.toString());
    }
  };

  const handleUseBtcValueChange = () => {
    const shouldUseBtcValue = !useBtcValue;
    setUseBtcValue(shouldUseBtcValue);

    if (shouldUseBtcValue) {
      // convert outer sats amount to btc
      setAmountDisplay(amount);
    } else {
      // convert btc to fiat
      const fiatAmount = getBtcFiatEquivalent(
        btcToSats(new BigNumber(amount)),
        BigNumber(btcFiatRate),
      )
        .toNumber()
        .toFixed(2);
      setAmountDisplay(fiatAmount);
    }
  };

  const handleBlur = () => {
    const isValidAmount = useBtcValue
      ? btcInputValidator.test(amountDisplay)
      : fiatInputValidator.test(amountDisplay);

    if (!isValidAmount) {
      const newAmount = useBtcValue
        ? btcInputExtractor.exec(amountDisplay)?.[0]
        : fiatInputExtractor.exec(amountDisplay)?.[0];
      handleAmountChange(newAmount || '0');
    }
  };

  return (
    <Container>
      <div>
        <Input
          title={t('BTC.AMOUNT', { currency: useBtcValue ? 'BTC' : fiatCurrency })}
          value={amountDisplay}
          onChange={(e) => handleAmountChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="0"
          infoPanel={
            <>
              <BalanceText>{t('BALANCE')} </BalanceText>
              {balance} {useBtcValue ? 'BTC' : fiatCurrency}
            </>
          }
          complications={
            <>
              <ConvertComplication onClick={handleUseBtcValueChange}>
                {useBtcValue ? '~' : ''}
                {sendAmountConverted} {useBtcValue ? fiatCurrency : 'BTC'} <ArrowsDownUp />
              </ConvertComplication>
              <VertRule />
              <MaxButton $sendMax={sendMax} onClick={() => setSendMax(!sendMax)}>
                MAX
              </MaxButton>
            </>
          }
          hideClear
        />
        Fee Rate
        <input type="text" value={feeRate} onChange={(e) => setFeeRate(e.target.value)} />
      </div>
      <Button title={t('NEXT')} onClick={handleNext} />
    </Container>
  );
}

export default AmountSelector;
