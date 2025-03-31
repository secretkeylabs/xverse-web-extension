import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useBtcAddressBalance from '@hooks/useBtcAddressBalance';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowsDownUp } from '@phosphor-icons/react';
import {
  type BtcPaymentType,
  btcToSats,
  currencySymbolMap,
  getBtcFiatEquivalent,
  getFiatBtcEquivalent,
} from '@secretkeylabs/xverse-core';
import Input, { ConvertComplication, MaxButton, VertRule } from '@ui-library/input';
import { HIDDEN_BALANCE_LABEL } from '@utils/constants';
import { satsToBtcString } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const BalanceText = styled.span`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_200};
`;

const BalanceDiv = styled.div`
  word-break: break-all;
  text-align: end;
`;

const ConvertedAmountWrapper = styled.div`
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  overridePaymentType?: BtcPaymentType;
};

function AmountSelector({
  amountSats,
  setAmountSats,
  sendMax,
  setSendMax,
  overridePaymentType,
  disabled = false,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { fiatCurrency, balanceHidden } = useWalletSelector();
  const { btcFiatRate } = useSupportedCoinRates();
  const selectedAccount = useSelectedAccount(overridePaymentType);
  const { data: addressBtcBalance } = useBtcAddressBalance(selectedAccount.btcAddress);

  const [amountDisplay, setAmountDisplay] = useState(
    amountSats && satsToBtcString(new BigNumber(amountSats)),
  );
  const [useBtcValue, setUseBtcValue] = useState(true);

  useEffect(() => {
    if (!sendMax) return;

    const amountToDisplay =
      amountSats &&
      (useBtcValue
        ? satsToBtcString(new BigNumber(amountSats))
        : getBtcFiatEquivalent(new BigNumber(amountSats), BigNumber(btcFiatRate)).toFixed(2));

    if (amountToDisplay !== amountDisplay) {
      setAmountDisplay(amountToDisplay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- We specifically only want to run this on these 2 deps
  }, [sendMax, amountSats]);

  const btcBalance = new BigNumber(addressBtcBalance?.confirmedBalance ?? 0);
  const balance = useBtcValue
    ? satsToBtcString(btcBalance)
    : getBtcFiatEquivalent(btcBalance, new BigNumber(btcFiatRate)).toFixed(2);

  const sendAmountConverted = useBtcValue
    ? getBtcFiatEquivalent(new BigNumber(amountSats), BigNumber(btcFiatRate)).toFixed(2)
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
    if (disabled) return;

    const shouldUseBtcValue = !useBtcValue;
    setUseBtcValue(shouldUseBtcValue);

    if (!amountDisplay || Number.isNaN(+amountDisplay)) return;

    if (shouldUseBtcValue) {
      // convert outer sats amount to btc
      setAmountDisplay(satsToBtcString(new BigNumber(amountSats)));
    } else {
      // convert btc to fiat
      const fiatAmount = getBtcFiatEquivalent(
        new BigNumber(amountSats),
        BigNumber(btcFiatRate),
      ).toFixed(2);
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
      titleElement={t('BTC.AMOUNT', { currency: useBtcValue ? 'BTC' : fiatCurrency })}
      value={amountDisplay}
      dataTestID="btc-amount"
      onChange={(e) => handleAmountChange(e.target.value)}
      onBlur={handleBlur}
      placeholder="0"
      infoPanel={
        <NumericFormat
          value={balance}
          displayType="text"
          thousandSeparator
          prefix={useBtcValue ? '' : `~${currencySymbolMap[fiatCurrency]}`}
          renderText={(value: string) => (
            <BalanceDiv data-testid="balance-label">
              <BalanceText>{t('BALANCE')}</BalanceText>
              {balanceHidden && ` ${HIDDEN_BALANCE_LABEL}`}
              {!balanceHidden && ` ${value} ${useBtcValue ? 'BTC' : fiatCurrency}`}
            </BalanceDiv>
          )}
        />
      }
      complications={
        <>
          <ConvertComplication disabled={disabled} onClick={handleUseBtcValueChange}>
            <NumericFormat
              value={sendAmountConverted}
              displayType="text"
              thousandSeparator
              prefix={useBtcValue ? `~${currencySymbolMap[fiatCurrency]}` : ''}
              renderText={(value: string) => (
                <ConvertedAmountWrapper>
                  {value} {useBtcValue ? fiatCurrency : 'BTC'}
                </ConvertedAmountWrapper>
              )}
            />
            <ArrowsDownUp size={16} weight="fill" />
          </ConvertComplication>
          <VertRule />
          <MaxButton disabled={sendMax || disabled} onClick={handleMaxClick}>
            MAX
          </MaxButton>
        </>
      }
      disabled={disabled}
      hideClear
      autoFocus
    />
  );
}

export default AmountSelector;
