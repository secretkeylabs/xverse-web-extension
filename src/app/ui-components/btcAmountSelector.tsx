import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowsDownUp } from '@phosphor-icons/react';
import {
  btcToSats,
  currencySymbolMap,
  getBtcFiatEquivalent,
  getFiatBtcEquivalent,
  satsToBtc,
} from '@secretkeylabs/xverse-core';
import Input from '@ui-library/input';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
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

  color: ${(props) => props.theme.colors.white_200};

  &:hover {
    color: ${(props) => props.theme.colors.white_0};
  }
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
    props.$sendMax ? props.theme.colors.tangerine : props.theme.colors.tangerine_400};
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  margin-right: ${(props) => props.theme.spacing(2)}px;

  &:hover {
    ${(props) => (props.$disabled ? '' : `color:${props.theme.colors.tangerine_200}`)};
  }
`;

const inputValidator = /^[0-9.]*$/;
const btcInputExtractor = /[0-9]+[.]?[0-9]{0,8}/;
const btcInputValidator = /^[0-9]+[.]?[0-9]{0,8}$/;
const fiatInputExtractor = /[0-9]+[.]?[0-9]{0,2}/;
const fiatInputValidator = /^[0-9]+[.]?[0-9]{0,2}$/;

const satsToBtcString = (num: BigNumber) =>
  satsToBtc(num)
    .toFixed(8)
    .replace(/\.?0+$/, '');

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
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { btcBalance: btcBalanceSats, btcFiatRate, fiatCurrency } = useWalletSelector();

  const [amountDisplay, setAmountDisplay] = useState(satsToBtcString(new BigNumber(amountSats)));
  const [useBtcValue, setUseBtcValue] = useState(true);

  useEffect(() => {
    if (!sendMax) return;

    const amountToDisplay = useBtcValue
      ? satsToBtcString(new BigNumber(amountSats))
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
    ? satsToBtcString(btcBalance)
    : getBtcFiatEquivalent(btcBalance, new BigNumber(btcFiatRate)).toFixed(2);

  const sendAmountConverted = useBtcValue
    ? getBtcFiatEquivalent(new BigNumber(amountSats), BigNumber(btcFiatRate)).toNumber().toFixed(2)
    : satsToBtcString(new BigNumber(amountSats));

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
      setAmountDisplay(satsToBtcString(new BigNumber(amountSats)));
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
        <NumericFormat
          value={balance}
          displayType="text"
          thousandSeparator
          prefix={useBtcValue ? '' : `~ ${currencySymbolMap[fiatCurrency]}`}
          renderText={(value: string) => (
            <div>
              <BalanceText>{t('BALANCE')} </BalanceText> {value}{' '}
              {useBtcValue ? 'BTC' : fiatCurrency}
            </div>
          )}
        />
      }
      complications={
        <>
          <ConvertComplication onClick={handleUseBtcValueChange}>
            <NumericFormat
              value={sendAmountConverted}
              displayType="text"
              thousandSeparator
              prefix={useBtcValue ? `~ ${currencySymbolMap[fiatCurrency]}` : ''}
              renderText={(value: string) => (
                <div>
                  {value} {useBtcValue ? fiatCurrency : 'BTC'}
                </div>
              )}
            />
            <ArrowsDownUp />
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
