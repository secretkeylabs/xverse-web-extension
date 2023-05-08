import { getBtcFiatEquivalent, getFiatEquivalent } from '@secretkeylabs/xverse-core';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import { StoreState } from '@stores/index';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  background: props.theme.colors.background.elevation1,
  borderRadius: 12,
  padding: '12px 16px',
  justifyContent: 'center',
  marginBottom: 12,
}));

const FeeText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
}));

const FeeTitleContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const FeeContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignItems: 'flex-end',
});

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
}));

const FiatAmountText = styled.h1((props) => ({
  ...props.theme.body_m,
  fontSize: 12,
  color: props.theme.colors.white[400],
}));

interface Props {
  fee: BigNumber;
  currency: string;
  title?: string;
}
function TransferFeeView({ fee, currency, title }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { btcFiatRate, stxBtcRate, fiatCurrency } = useSelector(
    (state: StoreState) => state.walletState,
  );
  const fiatRate = getFiatEquivalent(Number(fee), currency, stxBtcRate, btcFiatRate);
  const getFiatAmountString = (fiatAmount: BigNumber) => {
    if (fiatAmount) {
      if (fiatAmount.isLessThan(0.01)) {
        return `<${currencySymbolMap[fiatCurrency]}0.01 ${fiatCurrency}`;
      }
      return (
        <NumericFormat
          value={fiatAmount.toFixed(2).toString()}
          displayType="text"
          thousandSeparator
          prefix={`${currencySymbolMap[fiatCurrency]} `}
          suffix={` ${fiatCurrency}`}
          renderText={(value: string) => <FiatAmountText>{value}</FiatAmountText>}
        />
      );
    }
    return '';
  };

  return (
    <RowContainer>
      <FeeTitleContainer>
        <TitleText>{title ?? t('FEES')}</TitleText>
      </FeeTitleContainer>
      <FeeContainer>
        <NumericFormat
          value={fee.toString()}
          displayType="text"
          thousandSeparator
          suffix={` ${currency}`}
          renderText={(value: string) => <FeeText>{value}</FeeText>}
        />
        <FiatAmountText>
          {getFiatAmountString(
            currency === 'sats'
              ? getBtcFiatEquivalent(new BigNumber(fee), btcFiatRate)
              : new BigNumber(fiatRate!),
          )}
        </FiatAmountText>
      </FeeContainer>
    </RowContainer>
  );
}

export default TransferFeeView;
