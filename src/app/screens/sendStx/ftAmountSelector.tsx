import FiatAmountText from '@components/fiatAmountText';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowsDownUp } from '@phosphor-icons/react';
import { currencySymbolMap, type FungibleToken } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Input, { ConvertComplication, MaxButton } from '@ui-library/input';
import { HIDDEN_BALANCE_LABEL } from '@utils/constants';
import { ftDecimals } from '@utils/helper';
import { getFtTicker } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import Theme from 'theme';

const BalanceTextWrapper = styled.div`
  text-align: right;
`;

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

  const [amountDisplay, setAmountDisplay] = useState(amount);

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
    const isValidInput = inputValidator.test(newAmount);
    if (!isValidInput) return;

    setAmountDisplay(newAmount);

    if (!newAmount) {
      setAmount('0');
      setSendMax(false);
      return;
    }

    const isValidAmount = useTokenValue
      ? tokenInputValidator(tokenDecimals).test(newAmount)
      : fiatInputValidator.test(newAmount);

    if (!isValidAmount) return;

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
    <Input
      titleElement={t('BTC.AMOUNT', { currency: useTokenValue ? tokenSymbol : fiatCurrency })}
      value={amountDisplay}
      onChange={(e) => handleAmountChange(e.target.value)}
      onBlur={handleBlur}
      placeholder="0"
      infoPanel={
        <NumericFormat
          value={balance}
          displayType="text"
          thousandSeparator
          prefix={useTokenValue ? '' : `~ ${currencySymbolMap[fiatCurrency]}`}
          renderText={(value: string) => (
            <BalanceTextWrapper data-testid="balance-label">
              <BalanceText>{t('BALANCE')}</BalanceText>
              {balanceHidden && ` ${HIDDEN_BALANCE_LABEL}`}
              {!balanceHidden && ` ${value} ${useTokenValue ? tokenSymbol : fiatCurrency}`}
            </BalanceTextWrapper>
          )}
        />
      }
      complications={
        <>
          <ConvertComplication disabled={disabled} onClick={handleUseTokenValueChange}>
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
                  <div>
                    <AmountText typography="body_medium_s" color="white_200">
                      {value} {tokenSymbol}
                    </AmountText>
                  </div>
                )}
              />
            )}
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

export default FtAmountSelector;
