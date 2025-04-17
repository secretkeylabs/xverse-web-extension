import FiatAmountText from '@components/fiatAmountText';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowsDownUp } from '@phosphor-icons/react';
import { type FungibleToken } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import { MaxButton } from '@ui-library/input';
import TextArea from '@ui-library/textarea';
import { HIDDEN_BALANCE_LABEL } from '@utils/constants';
import { ftDecimals } from '@utils/helper';
import { getFtTicker } from '@utils/tokens';
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
const fiatInputExtractor = /[0-9]+[.]?[0-9]{0,2}/;
const fiatInputValidator = /^[0-9]+[.]?[0-9]{0,2}$/;

const tokenInputValidator = (decimals: number) => new RegExp(`^[0-9]+[.]?[0-9]{0,${decimals}}$`);
const tokenInputExtractor = (decimals: number) => new RegExp(`[0-9]+[.]?[0-9]{0,${decimals}}`);

const getTokenFiatEquivalent = (amount: BigNumber, fungibleToken: FungibleToken): BigNumber =>
  amount.multipliedBy(fungibleToken.tokenFiatRate ?? 0);

const getFiatTokenEquivalent = (fiatAmount: BigNumber, fungibleToken: FungibleToken): BigNumber =>
  fiatAmount.dividedBy(fungibleToken.tokenFiatRate ?? 1);

type Props = {
  amount: string;
  setAmount: (amount: string) => void;
  sendMax: boolean;
  setSendMax: (sendMax: boolean) => void;
  disabled?: boolean;
  fungibleToken: FungibleToken;
};

function FtAmountSelector({
  amount,
  setAmount,
  sendMax,
  setSendMax,
  disabled = false,
  fungibleToken,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });

  const { fiatCurrency, balanceHidden } = useWalletSelector();
  const tokenDecimals = fungibleToken.decimals ?? 0;
  const tokenSymbol = getFtTicker(fungibleToken);

  const [amountDisplay, setAmountDisplay] = useState(amount && amount !== '0' ? amount : '');

  const [useTokenValue, setUseTokenValue] = useState(true);

  useEffect(() => {
    if (!sendMax) return;

    const amountToDisplay =
      amount &&
      (useTokenValue
        ? amount
        : getTokenFiatEquivalent(BigNumber(amount), fungibleToken).toNumber().toFixed(2));

    if (amountToDisplay !== amountDisplay) {
      setAmountDisplay(amountToDisplay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- We specifically only want to run this on these 2 deps
  }, [sendMax, amount]);

  const getBalance = () => {
    if (tokenDecimals) {
      return ftDecimals(fungibleToken.balance, tokenDecimals);
    }
    return fungibleToken.balance;
  };

  const tokenBalance = BigNumber(getBalance() ?? '0');
  const balance = useTokenValue
    ? Number(tokenBalance)
    : getTokenFiatEquivalent(tokenBalance, fungibleToken).toNumber().toFixed(2);

  const handleAmountChange = (newAmount: string) => {
    if (!newAmount) {
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

    const isValidAmount = useTokenValue
      ? tokenInputValidator(tokenDecimals).test(newAmount)
      : fiatInputValidator.test(newAmount);

    if (!isValidAmount) return;

    setAmountDisplay(newAmount);
    setSendMax(false);

    if (useTokenValue) {
      setAmount(BigNumber(newAmount).toString());
    } else {
      const tokenAmount = getFiatTokenEquivalent(BigNumber(newAmount), fungibleToken);
      setAmount(tokenAmount.toString());
    }
  };

  const handleUseTokenValueChange = () => {
    if (disabled) return;

    const shouldUseTokenValue = !useTokenValue;
    setUseTokenValue(shouldUseTokenValue);

    if (!amountDisplay || Number.isNaN(+amountDisplay)) return;

    if (shouldUseTokenValue) {
      setAmountDisplay(amount);
    } else {
      const fiatAmount = getTokenFiatEquivalent(BigNumber(amount), fungibleToken)
        .toNumber()
        .toFixed(2);
      setAmountDisplay(fiatAmount);
    }
  };

  const handleBlur = () => {
    const isValidAmount = useTokenValue
      ? tokenInputValidator(tokenDecimals).test(amountDisplay)
      : fiatInputValidator.test(amountDisplay);

    if (!isValidAmount) {
      const newAmount = useTokenValue
        ? tokenInputExtractor(tokenDecimals).exec(amountDisplay)?.[0]
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
              {useTokenValue ? tokenSymbol : fiatCurrency} {t('BALANCE')}:{' '}
              {balanceHidden ? HIDDEN_BALANCE_LABEL : balance}
            </StyledP>
            <MaxButton disabled={sendMax || disabled} onClick={handleMaxClick}>
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
            onClick={handleUseTokenValueChange}
          />
        }
        disabled={disabled}
        hideClear
        autoFocus
      />
      <ConvertedAmountWrapper>
        {useTokenValue ? (
          <StyledFiatAmountText
            fiatAmount={getTokenFiatEquivalent(BigNumber(amount), fungibleToken)}
            fiatCurrency={fiatCurrency}
          />
        ) : (
          <NumericFormat
            value={Number(amount)}
            displayType="text"
            thousandSeparator
            renderText={(value: string) => (
              <AmountText typography="body_medium_s" color="white_200">
                {value} {tokenSymbol}
              </AmountText>
            )}
          />
        )}
      </ConvertedAmountWrapper>
    </>
  );
}

export default FtAmountSelector;
