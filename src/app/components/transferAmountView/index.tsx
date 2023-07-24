import useWalletSelector from '@hooks/useWalletSelector';
import { FungibleToken } from '@secretkeylabs/xverse-core';
import { getFiatEquivalent } from '@secretkeylabs/xverse-core/transactions';
import { getTicker } from '@utils/helper';
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

  function getFtTicker() {
    if (fungibleToken?.ticker) {
      return fungibleToken?.ticker.toUpperCase();
    } if (fungibleToken?.name) {
      return getTicker(fungibleToken.name).toUpperCase();
    } return '';
  }

  useEffect(() => {
    let amountInCurrency;
    if (currency === 'FT') {
      amountInCurrency = new BigNumber(amount).multipliedBy(fungibleToken?.tokenFiatRate!);
      if (amountInCurrency.isLessThan(0.01)) {
        amountInCurrency = '0.01';
      }
    } else { amountInCurrency = getFiatEquivalent(Number(amount), currency, new BigNumber(stxBtcRate), new BigNumber(btcFiatRate), fungibleToken); }
    setFiatAmount(amountInCurrency);
  }, [amount]);

  return (
    <SendAmountContainer>
      <TitleText>{t('INDICATION')}</TitleText>
      <NumericFormat
        value={Number(amount)}
        displayType="text"
        thousandSeparator
        suffix={currency === 'FT' ? ` ${getFtTicker()} ` : ` ${currency}`}
        renderText={(value) => <AmountText>{value}</AmountText>}
      />
      <FiatAmountText>{`~ $ ${fiatAmount} ${fiatCurrency}`}</FiatAmountText>
    </SendAmountContainer>
  );
}

export default TransferAmountView;
