import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowsDownUp } from '@phosphor-icons/react';
import {
  btcToSats,
  getBtcFiatEquivalent,
  getFiatBtcEquivalent,
  satsToBtc,
} from '@secretkeylabs/xverse-core';
import Input from '@ui-library/input';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

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

const MaxButton = styled.div<{ $sendMax: boolean; $disabled: boolean }>`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) =>
    props.$sendMax ? props.theme.colors.tangerine : props.theme.colors.tangerine_dark};
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  user-select: none;

  &:hover {
    ${(props) => (props.$disabled ? '' : `color:${props.theme.colors.tangerine_light}`)};
  }
`;

const inputValidator = /^[0-9.]*$/;
const btcInputExtractor = /[0-9]+[.]?[0-9]{0,8}/;
const btcInputValidator = /^[0-9]+[.]?[0-9]{0,8}$/;
const fiatInputExtractor = /[0-9]+[.]?[0-9]{0,2}/;
const fiatInputValidator = /^[0-9]+[.]?[0-9]{0,2}$/;

type Props = {
  amountSats: string;
  setAmountSats: (amount: string) => void;
  sendMax: boolean;
  setSendMax: (sendMax: boolean) => void;
  disabled?: boolean;
};

function AmountSelector({
  amountSats,
  setAmountSats,
  sendMax,
  setSendMax,
  disabled = false,
}: Props) {
  BigNumber.config({ EXPONENTIAL_AT: 8 });
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { btcBalance: btcBalanceSats, btcFiatRate, fiatCurrency } = useWalletSelector();

  const [amountDisplay, setAmountDisplay] = useState(
    satsToBtc(new BigNumber(amountSats)).toString(),
  );
  const [useBtcValue, setUseBtcValue] = useState(true);

  useEffect(() => {
    if (!sendMax) return;

    const amountToDisplay = useBtcValue
      ? satsToBtc(new BigNumber(amountSats)).toString()
      : getBtcFiatEquivalent(new BigNumber(amountSats), BigNumber(btcFiatRate))
          .toNumber()
          .toFixed(2);
    if (amountToDisplay !== amountDisplay) {
      setAmountDisplay(amountToDisplay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- We specifically only want to run this on these 2 deps
  }, [sendMax, amountSats]);

  const btcBalance = new BigNumber(btcBalanceSats);
  const balance = useBtcValue
    ? satsToBtc(btcBalance).toString()
    : getBtcFiatEquivalent(btcBalance, new BigNumber(btcFiatRate)).toFixed(2);

  const sendAmountConverted = useBtcValue
    ? getBtcFiatEquivalent(new BigNumber(amountSats), BigNumber(btcFiatRate)).toNumber().toFixed(2)
    : satsToBtc(new BigNumber(amountSats)).toString();

  const handleAmountChange = (newAmount: string) => {
    const isValidInput = inputValidator.test(newAmount);
    if (!isValidInput) return;

    setAmountDisplay(newAmount);

    if (!newAmount) {
      setAmountSats('0');
      setSendMax(false);
      return;
    }

    const isValidAmount = useBtcValue
      ? btcInputValidator.test(newAmount)
      : fiatInputValidator.test(newAmount);

    if (!isValidAmount) return;

    setSendMax(false);

    if (useBtcValue) {
      setAmountSats(btcToSats(new BigNumber(newAmount)).toString());
    } else {
      const btcAmount = btcToSats(
        getFiatBtcEquivalent(new BigNumber(newAmount), new BigNumber(btcFiatRate)),
      );
      setAmountSats(btcAmount.toString());
    }
  };

  const handleUseBtcValueChange = () => {
    const shouldUseBtcValue = !useBtcValue;
    setUseBtcValue(shouldUseBtcValue);

    if (shouldUseBtcValue) {
      // convert outer sats amount to btc
      setAmountDisplay(satsToBtc(new BigNumber(amountSats)).toString());
    } else {
      // convert btc to fiat
      const fiatAmount = getBtcFiatEquivalent(new BigNumber(amountSats), BigNumber(btcFiatRate))
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

  const handleMaxClick = () => {
    if (disabled) return;

    setSendMax(!sendMax);
  };

  return (
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
          <MaxButton $sendMax={sendMax} $disabled={disabled} onClick={handleMaxClick}>
            MAX
          </MaxButton>
        </>
      }
      disabled={disabled}
      hideClear
    />
  );
}

export default AmountSelector;
