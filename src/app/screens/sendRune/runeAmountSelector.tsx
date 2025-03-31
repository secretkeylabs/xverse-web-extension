import FiatAmountText from '@components/fiatAmountText';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowsDownUp } from '@phosphor-icons/react';
import { currencySymbolMap, type FungibleToken } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Input, { ConvertComplication, MaxButton, VertRule } from '@ui-library/input';
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

const AmountText = styled(StyledP)`
  margin-right: ${(props) => props.theme.space.xxs};
`;

const StyledFiatAmountText = styled(FiatAmountText)`
  ${(props) => props.theme.typography.body_medium_s}
  color: ${(props) => props.theme.colors.white_200};
`;

const fiatInputValidator = /^[0-9]+[.]?[0-9]{0,2}$/;
const tokenInputValidator = (decimals: number) => {
  // If no decimals are allowed, only allow whole numbers (no decimal point)
  if (decimals === 0) {
    return /^[0-9]*$/; // Match only whole numbers
  }
  // Otherwise, allow numbers with the specified number of decimal places
  return new RegExp(`^[0-9]+([.][0-9]{0,${decimals}})?$`);
};

const getTokenFiatEquivalent = (amount: BigNumber, fungibleToken: FungibleToken): BigNumber =>
  amount.multipliedBy(fungibleToken.tokenFiatRate ?? 0);

const getFiatTokenEquivalent = (fiatAmount: BigNumber, fungibleToken: FungibleToken): BigNumber =>
  fiatAmount.dividedBy(fungibleToken.tokenFiatRate ?? 1);

type Props = {
  token: FungibleToken;
  amountToSend: string;
  setAmountToSend: (amount: string) => void;
  useTokenValue: boolean;
  setUseTokenValue: (toggle: boolean) => void;
  sendMax: boolean;
  setSendMax: (sendMax: boolean) => void;
  amountError: string;
};

function RuneAmountSelector({
  token,
  amountToSend,
  setAmountToSend,
  useTokenValue,
  setUseTokenValue,
  sendMax,
  setSendMax,
  amountError,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { fiatCurrency, balanceHidden } = useWalletSelector();
  const [displayAmount, setDisplayAmount] = useState(amountToSend);
  const tokenDecimals = Number(token.decimals ?? 0);
  const tokenBalance = new BigNumber(ftDecimals(token.balance, tokenDecimals));
  const displayBalance = useTokenValue
    ? Number(tokenBalance)
    : getTokenFiatEquivalent(tokenBalance, token).toNumber().toFixed(2);

  useEffect(() => {
    if (!sendMax) return;
    setDisplayAmount(
      useTokenValue
        ? tokenBalance.toString()
        : getTokenFiatEquivalent(tokenBalance, token).toNumber().toFixed(2),
    );
    setAmountToSend(tokenBalance.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendMax]);

  const handleAmountChange = (newAmount: string) => {
    if (!newAmount) {
      setAmountToSend('0');
      setDisplayAmount('');
      setSendMax(false);
      return;
    }
    const isValidInput = useTokenValue
      ? tokenInputValidator(tokenDecimals).test(newAmount)
      : fiatInputValidator.test(newAmount);

    if (!isValidInput) return;
    setDisplayAmount(newAmount);
    setSendMax(false);
    if (useTokenValue) {
      setAmountToSend(BigNumber(newAmount).toString());
    } else {
      // strip to exact decimals the rune support
      const runeAmount = getFiatTokenEquivalent(BigNumber(newAmount), token)
        .toNumber()
        .toFixed(tokenDecimals);
      setAmountToSend(runeAmount);
    }
  };

  const handleUseTokenValueChange = () => {
    const shouldUseTokenValue = !useTokenValue;
    setUseTokenValue(shouldUseTokenValue);
    if (!displayAmount || Number.isNaN(+displayAmount)) return;
    if (shouldUseTokenValue) {
      setDisplayAmount(amountToSend);
    } else {
      const fiatAmount = getTokenFiatEquivalent(BigNumber(amountToSend), token)
        .toNumber()
        .toFixed(2);
      setDisplayAmount(fiatAmount);
    }
  };

  const handleMaxClick = () => setSendMax(!sendMax);

  return (
    <Input
      titleElement={t('BTC.AMOUNT', {
        currency: useTokenValue ? getFtTicker(token) : fiatCurrency,
      })}
      value={displayAmount}
      dataTestID="send-input"
      onChange={(e) => handleAmountChange(e.target.value)}
      placeholder="0"
      infoPanel={
        <NumericFormat
          value={displayBalance}
          displayType="text"
          thousandSeparator
          prefix={useTokenValue ? '' : `~ ${currencySymbolMap[fiatCurrency]}`}
          renderText={(value: string) => (
            <BalanceTextWrapper data-testid="balance-label">
              <BalanceText>{t('BALANCE')}</BalanceText>
              {balanceHidden && ` ${HIDDEN_BALANCE_LABEL}`}
              {!balanceHidden && ` ${value} ${useTokenValue ? getFtTicker(token) : fiatCurrency}`}
            </BalanceTextWrapper>
          )}
        />
      }
      complications={
        <>
          {token.tokenFiatRate && (
            <ConvertComplication onClick={handleUseTokenValueChange}>
              {useTokenValue ? (
                <StyledFiatAmountText
                  fiatAmount={getTokenFiatEquivalent(BigNumber(amountToSend), token)}
                  fiatCurrency={fiatCurrency}
                />
              ) : (
                <NumericFormat
                  value={Number(amountToSend)}
                  displayType="text"
                  thousandSeparator
                  renderText={(value: string) => (
                    <div>
                      <AmountText typography="body_medium_s" color="white_200">
                        {value} {getFtTicker(token)}
                      </AmountText>
                    </div>
                  )}
                />
              )}
              <ArrowsDownUp size={16} color={Theme.colors.white_200} />
            </ConvertComplication>
          )}
          <VertRule />
          <MaxButton disabled={sendMax} onClick={handleMaxClick}>
            MAX
          </MaxButton>
        </>
      }
      feedback={amountError !== '' ? [{ message: amountError, variant: 'danger' }] : []}
      hideClear
      autoFocus
    />
  );
}

export default RuneAmountSelector;
