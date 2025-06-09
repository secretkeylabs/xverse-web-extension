import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowsDownUp } from '@phosphor-icons/react';
import { currencySymbolMap, type FungibleToken } from '@secretkeylabs/xverse-core';
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
};

function RuneAmountSelector({
  token,
  amountToSend,
  setAmountToSend,
  useTokenValue,
  setUseTokenValue,
  sendMax,
  setSendMax,
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newAmount = e.target.value;
    if (!newAmount) {
      setAmountToSend('0');
      setDisplayAmount('');
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

  const getSendAmountConverted = () => {
    if (!amountToSend || Number(amountToSend) === 0) return '0.00';

    if (useTokenValue) {
      return getTokenFiatEquivalent(BigNumber(amountToSend), token).toNumber().toFixed(2);
    }

    return amountToSend;
  };

  return (
    <>
      <TextArea
        titleElement={
          <BalanceContainer data-testid="balance-label">
            <StyledP typography="body_medium_m" color="white_200">
              {useTokenValue ? getFtTicker(token) : fiatCurrency} {t('BALANCE')}:{' '}
              {balanceHidden ? HIDDEN_BALANCE_LABEL : displayBalance}
            </StyledP>
            <MaxButton disabled={sendMax} onClick={handleMaxClick}>
              {t('MAX')}
            </MaxButton>
          </BalanceContainer>
        }
        value={displayAmount}
        dataTestID="send-input"
        onChange={handleAmountChange}
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
        hideClear
        autoFocus
      />
      <ConvertedAmountWrapper>
        <NumericFormat
          value={getSendAmountConverted()}
          displayType="text"
          thousandSeparator
          prefix={useTokenValue ? `~${currencySymbolMap[fiatCurrency]}` : ''}
          renderText={(value: string) => (
            <StyledP typography="body_medium_m" color="white_200">
              {value} {useTokenValue ? fiatCurrency : getFtTicker(token)}
            </StyledP>
          )}
        />
      </ConvertedAmountWrapper>
    </>
  );
}

export default RuneAmountSelector;
