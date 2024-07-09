import { FungibleToken } from '@secretkeylabs/xverse-core';
import Input, { MaxButton, VertRule } from '@ui-library/input';
import { getFtBalance } from '@utils/tokens';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const BalanceText = styled.span`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_200};
`;

const BalanceDiv = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

type Props = {
  token: FungibleToken;
  amountToSend: string;
  setAmountToSend: (amount: string) => void;
  sendMax: boolean;
  setSendMax: (sendMax: boolean) => void;
  amountError: string;
};

function RuneAmountSelector({
  token,
  amountToSend,
  setAmountToSend,
  sendMax,
  setSendMax,
  amountError,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  // construct regex based on runes divisibility (decimals)
  const tokenInputValidator = new RegExp(`^(?:[0-9]+(?:\\.[0-9]{0,${token.decimals}})?)?$`);
  const balance = getFtBalance(token);

  useEffect(() => {
    if (sendMax) {
      setAmountToSend(String(balance));
    }
  }, [sendMax]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAmountChange = (newAmount: string) => {
    const isValidInput = tokenInputValidator.test(newAmount);
    if (isValidInput) {
      setAmountToSend(newAmount);
      setSendMax(false);
    }
  };

  const handleMaxClick = () => setSendMax(!sendMax);

  return (
    <Input
      title={t('AMOUNT', { currency: token.ticker })}
      value={amountToSend}
      onChange={(e) => handleAmountChange(e.target.value)}
      placeholder="0"
      infoPanel={
        <BalanceDiv>
          <BalanceText>{t('BALANCE')} </BalanceText>
          <NumericFormat value={balance} displayType="text" thousandSeparator />
        </BalanceDiv>
      }
      complications={
        <>
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
