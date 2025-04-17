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
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import { MaxButton } from '@ui-library/input';
import TextArea from '@ui-library/textarea';
import { HIDDEN_BALANCE_LABEL } from '@utils/constants';
import { satsToBtcString } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const BalanceContainer = styled.div`
  display: flex;
  gap: ${(props) => props.theme.space.xs};
`;

const ConvertedAmountWrapper = styled.div`
  width: 100%;
  word-break: break-all;
`;

const ConvertButton = styled(Button)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
`;

// @TODO: Add e2e tests for these regex validators
const inputValidator = /^[0-9.]*$/;
const btcInputExtractor = /(?:[0-9]{1,8}(?:\.[0-9]{0,8})?|\.[0-9]{1,8}|)/;
const btcInputValidator = /^(?:[0-9]{1,8}(?:\.[0-9]{0,8})?|\.[0-9]{1,8}|)$/;
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

  const getSendAmountConverted = () => {
    if (!amountSats) return '0.00';

    if (useBtcValue) {
      return getBtcFiatEquivalent(new BigNumber(amountSats), BigNumber(btcFiatRate)).toFixed(2);
    }

    return satsToBtcString(new BigNumber(amountSats));
  };

  const handleAmountChange = (newAmount: string) => {
    if (!newAmount) {
      setAmountDisplay(newAmount);
      setAmountSats('0');
      setSendMax(false);
      return;
    }

    // If user starts with a decimal point, prepend a zero
    if (newAmount.startsWith('.')) {
      newAmount = `0${newAmount}`;
    }

    // If user enters a number after a leading zero, replace the zero
    if (newAmount.length > 1 && newAmount.startsWith('0') && newAmount[1] !== '.') {
      newAmount = newAmount.slice(1);
    }

    // Basic input validation (for both fiat and btc)
    const isValidInput = inputValidator.test(newAmount);
    if (!isValidInput) return;

    const isValidAmount = useBtcValue
      ? btcInputValidator.test(newAmount)
      : fiatInputValidator.test(newAmount);

    if (!isValidAmount) return;

    setAmountDisplay(newAmount);
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
    <>
      <TextArea
        titleElement={
          <BalanceContainer data-testid="balance-label">
            <StyledP typography="body_medium_m" color="white_200">
              {useBtcValue ? 'BTC' : fiatCurrency} {t('BALANCE')}:{' '}
              {balanceHidden ? HIDDEN_BALANCE_LABEL : balance}
            </StyledP>
            <MaxButton disabled={sendMax || disabled} onClick={handleMaxClick}>
              {t('MAX')}
            </MaxButton>
          </BalanceContainer>
        }
        value={amountDisplay}
        dataTestID="btc-amount"
        onChange={(e) => handleAmountChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="0"
        rows={1}
        complications={
          <ConvertButton
            variant="secondary"
            title=""
            icon={<ArrowsDownUp size={20} />}
            disabled={disabled}
            onClick={handleUseBtcValueChange}
          />
        }
        disabled={disabled}
        hideClear
        autoFocus
      />
      <ConvertedAmountWrapper>
        <NumericFormat
          value={getSendAmountConverted()}
          displayType="text"
          thousandSeparator
          prefix={useBtcValue ? `~${currencySymbolMap[fiatCurrency]}` : ''}
          renderText={(value: string) => (
            <StyledP typography="body_medium_m" color="white_200">
              {value} {useBtcValue ? fiatCurrency : 'BTC'}
            </StyledP>
          )}
        />
      </ConvertedAmountWrapper>
    </>
  );
}

export default AmountSelector;
