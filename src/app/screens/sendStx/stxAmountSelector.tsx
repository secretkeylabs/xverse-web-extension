import FiatAmountText from '@components/fiatAmountText';
import { microStxToStx } from '@components/postCondition/postConditionView/helper';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowsDownUp } from '@phosphor-icons/react';
import {
  currencySymbolMap,
  getStxFiatEquivalent,
  getStxTokenEquivalent,
  stxToMicrostacks,
} from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Input, { ConvertComplication, MaxButton } from '@ui-library/input';
import { HIDDEN_BALANCE_LABEL } from '@utils/constants';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import Theme from 'theme';

const BalanceText = styled.span`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_200};
`;

const VertRule = styled.div`
  width: 1px;
  height: 16px;
  background-color: ${(props) => props.theme.colors.white_800};
  margin: 0 ${(props) => props.theme.space.xs};
`;

const AmountText = styled(StyledP)`
  margin-right: ${(props) => props.theme.space.xxs};
`;

const StyledFiatAmountText = styled(FiatAmountText)`
  ${(props) => props.theme.typography.body_medium_s}
  color: ${(props) => props.theme.colors.white_200};
`;

const ConvertedAmountWrapper = styled.div`
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
    amount && microStxToStxString(BigNumber(amount)),
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
    const isValidInput = inputValidator.test(newAmount);
    if (!isValidInput) return;

    setAmountDisplay(newAmount);

    if (!newAmount) {
      setAmount('0');
      setSendMax(false);
      return;
    }

    const isValidAmount = useStxValue
      ? stxInputValidator.test(newAmount)
      : fiatInputValidator.test(newAmount);

    if (!isValidAmount) return;

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
    <Input
      titleElement={t('BTC.AMOUNT', { currency: useStxValue ? 'STX' : fiatCurrency })}
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
            <div data-testid="balance-label">
              <BalanceText>{t('BALANCE')}</BalanceText>
              {balanceHidden && ` ${HIDDEN_BALANCE_LABEL}`}
              {!balanceHidden && ` ${value} ${useStxValue ? 'STX' : fiatCurrency}`}
            </div>
          )}
        />
      }
      complications={
        <>
          <ConvertComplication disabled={disabled} onClick={handleUseStxValueChange}>
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
            <ArrowsDownUp size={16} color={Theme.colors.white_200} />
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

export default StxAmountSelector;
