import useWalletSelector from '@hooks/useWalletSelector';
import { FungibleToken } from '@secretkeylabs/xverse-core';
import { getFiatEquivalent } from '@secretkeylabs/xverse-core/transactions';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const SendAmountContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  textTransform: 'uppercase',
}));

const AmountText = styled.h1((props) => ({
  ...props.theme.headline_category_m,
  textTransform: 'uppercase',
  fontSize: 28,
}));

const FiatAmountText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
}));

interface Props {
  amount: BigNumber;
  currency : string;
  fungibleToken?: FungibleToken
}

function TransferAmountView({ amount, currency, fungibleToken }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const [fiatAmount, setFiatAmount] = useState<string | undefined>('0');
  const {
    stxBtcRate, btcFiatRate, fiatCurrency,
  } = useWalletSelector();

  useEffect(() => {
    const amountInCurrency = getFiatEquivalent(Number(amount), currency, stxBtcRate, btcFiatRate, fungibleToken);
    setFiatAmount(amountInCurrency);
  }, [amount]);

  return (
    <SendAmountContainer>
      <TitleText>{t('INDICATION')}</TitleText>
      <NumericFormat
        value={Number(amount)}
        displayType="text"
        thousandSeparator
        suffix={` ${currency}`}
        renderText={(value) => <AmountText>{value}</AmountText>}
      />
      <FiatAmountText>{`~ $ ${fiatAmount} ${fiatCurrency}`}</FiatAmountText>
    </SendAmountContainer>
  );
}

export default TransferAmountView;
