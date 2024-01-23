import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowsDownUp } from '@phosphor-icons/react';
import {
  currencySymbolMap,
  getStxFiatEquivalent,
  satsToBtc,
  stxToMicrostacks,
} from '@secretkeylabs/xverse-core';
import Input from '@ui-library/input';
import { microStxToStx } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const BalanceText = styled.span`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_200};
`;

const ConvertComplication = styled.div<{ $disabled?: boolean }>`
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  user-select: none;

  display: flex;
  align-items: center;
  gap: 2px;

  color: ${(props) => props.theme.colors.white_200};

  &:hover {
    color: ${(props) =>
      props.$disabled ? props.theme.colors.white_200 : props.theme.colors.white_0};
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
  amount: string;
  setAmount: (amount: string) => void;
  sendMax: boolean;
  setSendMax: (sendMax: boolean) => void;
  disabled?: boolean;
};

function StxAmountSelector({ amount, setAmount, sendMax, setSendMax, disabled = false }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { stxBalance: stxBalanceStr, btcFiatRate, stxBtcRate, fiatCurrency } = useWalletSelector();

  const [amountDisplay, setAmountDisplay] = useState(amount && microStxToStx(amount).toString());

  const [useStxValue, setUseStxValue] = useState(true);

  useEffect(() => {
    if (!sendMax) return;

    const amountToDisplay =
      amount &&
      (useStxValue
        ? satsToBtcString(new BigNumber(amount))
        : getStxFiatEquivalent(
            new BigNumber(amount),
            new BigNumber(stxBtcRate),
            new BigNumber(btcFiatRate),
          )
            .toNumber()
            .toFixed(2));

    if (amountToDisplay !== amountDisplay) {
      setAmountDisplay(amountToDisplay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- We specifically only want to run this on these 2 deps
  }, [sendMax, amount]);

  const stxBalance = new BigNumber(stxBalanceStr);
  const balance = useStxValue
    ? microStxToStx(stxBalance).toString()
    : getStxFiatEquivalent(stxBalance, new BigNumber(stxBtcRate), new BigNumber(btcFiatRate))
        .toNumber()
        .toFixed(2);

  const sendAmountConverted = useStxValue
    ? getStxFiatEquivalent(
        new BigNumber(amount),
        new BigNumber(stxBtcRate),
        new BigNumber(btcFiatRate),
      )
        .toNumber()
        .toFixed(2)
    : microStxToStx(stxBalance).toString();

  const handleAmountChange = (newAmount: string) => {
    const isValidInput = inputValidator.test(newAmount);
    if (!isValidInput) return;

    setAmountDisplay(newAmount);

    if (!newAmount) {
      setAmount('0');
      setSendMax(false);
      return;
    }

    const isValidAmount = useStxValue
      ? btcInputValidator.test(newAmount)
      : fiatInputValidator.test(newAmount);

    if (!isValidAmount) return;

    setSendMax(false);

    if (useStxValue) {
      setAmount(stxToMicrostacks(new BigNumber(newAmount)).toString());
    } else {
      const stxAmount = stxToMicrostacks(
        getStxFiatEquivalent(
          new BigNumber(newAmount),
          new BigNumber(stxBtcRate),
          new BigNumber(btcFiatRate),
        ),
      );
      setAmount(stxAmount.toString());
    }
  };

  const handleUseBtcValueChange = () => {
    if (disabled) return;

    const shouldUseBtcValue = !useStxValue;
    setUseStxValue(shouldUseBtcValue);

    if (!amountDisplay || Number.isNaN(+amountDisplay)) return;

    if (shouldUseBtcValue) {
      // convert outer sats amount to btc
      setAmountDisplay(satsToBtcString(new BigNumber(amount)));
    } else {
      // convert btc to fiat
      const fiatAmount = getStxFiatEquivalent(
        new BigNumber(amount),
        new BigNumber(stxBtcRate),
        new BigNumber(btcFiatRate),
      )
        .toNumber()
        .toFixed(2);
      setAmountDisplay(fiatAmount);
    }
  };

  const handleBlur = () => {
    const isValidAmount = useStxValue
      ? btcInputValidator.test(amountDisplay)
      : fiatInputValidator.test(amountDisplay);

    if (!isValidAmount) {
      const newAmount = useStxValue
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
      title={t('BTC.AMOUNT', { currency: useStxValue ? 'STX' : fiatCurrency })}
      value={amountDisplay}
      onChange={(e) => handleAmountChange(e.target.value)}
      onBlur={handleBlur}
      placeholder="0"
      infoPanel={
        <NumericFormat
          value={balance}
          displayType="text"
          thousandSeparator
          prefix={useStxValue ? '' : `~ ${currencySymbolMap[fiatCurrency]}`}
          renderText={(value: string) => (
            <div>
              <BalanceText>{t('BALANCE')} </BalanceText> {value}{' '}
              {useStxValue ? 'STX' : fiatCurrency}
            </div>
          )}
        />
      }
      complications={
        <>
          <ConvertComplication $disabled={disabled} onClick={handleUseBtcValueChange}>
            <NumericFormat
              value={sendAmountConverted}
              displayType="text"
              thousandSeparator
              prefix={useStxValue ? `~ ${currencySymbolMap[fiatCurrency]}` : ''}
              renderText={(value: string) => (
                <div>
                  {value} {useStxValue ? fiatCurrency : 'STX'}
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

export default StxAmountSelector;
