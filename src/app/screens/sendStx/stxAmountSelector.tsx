import FiatAmountText from '@components/fiatAmountText';
import { microStxToStx } from '@components/postCondition/postConditionView/helper';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowsDownUp } from '@phosphor-icons/react';
import {
  getStxFiatEquivalent,
  getStxTokenEquivalent,
  stxToMicrostacks,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import { MaxButton } from '@ui-library/input';
import TextArea from '@ui-library/textarea';
import { HIDDEN_BALANCE_LABEL } from '@utils/constants';
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

const AmountText = styled(StyledP)`
  margin-right: ${(props) => props.theme.space.xxs};
`;

const StyledFiatAmountText = styled(FiatAmountText)`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_200};
`;

const inputValidator = /^[0-9.]*$/;
const stxInputExtractor = /[0-9]+[.]?[0-9]{0,6}/;
const stxInputValidator = /^[0-9]+[.]?[0-9]{0,6}$/;
const fiatInputExtractor = /[0-9]+[.]?[0-9]{0,2}/;
const fiatInputValidator = /^[0-9]+[.]?[0-9]{0,2}$/;

const microStxToStxString = (num: string | number | BigNumber): string =>
  microStxToStx(num)
    .toFixed(6)
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

  const { fiatCurrency, balanceHidden } = useWalletSelector();
  const { data: stxData } = useStxWalletData();
  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();
  const stxBalanceStr = stxData?.availableBalance.toString() ?? '0';

  const [amountDisplay, setAmountDisplay] = useState(
    amount && amount !== '0' ? microStxToStxString(BigNumber(amount)) : '',
  );

  const [useStxValue, setUseStxValue] = useState(true);

  useEffect(() => {
    if (!sendMax) return;

    const amountToDisplay =
      amount &&
      (useStxValue
        ? microStxToStxString(BigNumber(amount))
        : getStxFiatEquivalent(BigNumber(amount), BigNumber(stxBtcRate), BigNumber(btcFiatRate))
            .toNumber()
            .toFixed(2));

    if (amountToDisplay !== amountDisplay) {
      setAmountDisplay(amountToDisplay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- We specifically only want to run this on these 2 deps
  }, [sendMax, amount]);

  const stxBalance = BigNumber(stxBalanceStr);
  const balance = useStxValue
    ? microStxToStxString(stxBalance)
    : getStxFiatEquivalent(stxBalance, BigNumber(stxBtcRate), BigNumber(btcFiatRate))
        .toNumber()
        .toFixed(2);

  const handleAmountChange = (newAmount: string) => {
    if (!newAmount) {
      setAmountDisplay(newAmount);
      setAmount('0');
      setAmountDisplay('');
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

    const isValidInput = inputValidator.test(newAmount);
    if (!isValidInput) return;

    const isValidAmount = useStxValue
      ? stxInputValidator.test(newAmount)
      : fiatInputValidator.test(newAmount);

    if (!isValidAmount) return;

    setAmountDisplay(newAmount);
    setSendMax(false);

    if (useStxValue) {
      setAmount(stxToMicrostacks(BigNumber(newAmount)).toFixed(0, BigNumber.ROUND_DOWN));
    } else {
      const stxAmount = stxToMicrostacks(
        getStxTokenEquivalent(BigNumber(newAmount), BigNumber(stxBtcRate), BigNumber(btcFiatRate)),
      );
      setAmount(stxAmount.toFixed(0, BigNumber.ROUND_DOWN));
    }
  };

  const handleUseStxValueChange = () => {
    if (disabled) return;

    const shouldUseStxValue = !useStxValue;
    setUseStxValue(shouldUseStxValue);

    if (!amountDisplay || Number.isNaN(+amountDisplay)) return;

    if (shouldUseStxValue) {
      // convert outer sats amount to btc
      setAmountDisplay(microStxToStxString(BigNumber(amount)));
    } else {
      // convert btc to fiat
      const fiatAmount = getStxFiatEquivalent(
        BigNumber(amount),
        BigNumber(stxBtcRate),
        BigNumber(btcFiatRate),
      )
        .toNumber()
        .toFixed(2);
      setAmountDisplay(fiatAmount);
    }
  };

  const handleBlur = () => {
    const isValidAmount = useStxValue
      ? stxInputValidator.test(amountDisplay)
      : fiatInputValidator.test(amountDisplay);

    if (!isValidAmount) {
      const newAmount = useStxValue
        ? stxInputExtractor.exec(amountDisplay)?.[0]
        : fiatInputExtractor.exec(amountDisplay)?.[0];
      handleAmountChange(newAmount || '0');
    }
  };

  const handleMaxClick = () => setSendMax(!sendMax);

  return (
    <>
      <TextArea
        titleElement={
          <BalanceContainer data-testid="balance-label">
            <StyledP typography="body_medium_m" color="white_200">
              {useStxValue ? 'STX' : fiatCurrency} {t('BALANCE')}:{' '}
              {balanceHidden ? HIDDEN_BALANCE_LABEL : balance}
            </StyledP>
            <MaxButton disabled={sendMax} onClick={handleMaxClick}>
              {t('MAX')}
            </MaxButton>
          </BalanceContainer>
        }
        value={amountDisplay}
        onChange={(e) => handleAmountChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="0"
        rows={1}
        complications={
          <ConvertButton
            variant="secondary"
            title=""
            icon={<ArrowsDownUp size={20} />}
            onClick={handleUseStxValueChange}
          />
        }
        disabled={disabled}
        hideClear
        autoFocus
      />
      <ConvertedAmountWrapper>
        {useStxValue ? (
          <StyledFiatAmountText
            fiatAmount={getStxFiatEquivalent(
              BigNumber(amount),
              BigNumber(stxBtcRate),
              BigNumber(btcFiatRate),
            )}
            fiatCurrency={fiatCurrency}
          />
        ) : (
          <NumericFormat
            value={microStxToStxString(amount)}
            displayType="text"
            thousandSeparator
            renderText={(value: string) => (
              <AmountText typography="body_medium_s" color="white_200">
                {value} STX
              </AmountText>
            )}
          />
        )}
      </ConvertedAmountWrapper>
    </>
  );
}

export default StxAmountSelector;
