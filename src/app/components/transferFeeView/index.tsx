import { getBtcFiatEquivalent } from '@secretkeylabs/xverse-core/currency';
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
  marginTop: props.theme.spacing(6),
}));

const FeeText = styled.h1((props) => ({
  ...props.theme.body_m,
}));

const FeeTitleContainer = styled.div({
  display: 'flex',
  flex: 1,
});

const FeeContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  textTransform: 'uppercase',
}));

const FiatAmountText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['400'],
}));

interface Props {
  fee: BigNumber;
  currency: string;
}
function TransferFeeView({ fee, currency }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { btcFiatRate, fiatCurrency } = useSelector((state: StoreState) => state.walletState);

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
        <TitleText>{t('FEES')}</TitleText>
      </FeeTitleContainer>
      <FeeContainer>
        <FeeText>{`${fee.toString()} ${currency}`}</FeeText>
        <FiatAmountText>
          {getFiatAmountString(getBtcFiatEquivalent(new BigNumber(fee), btcFiatRate))}
        </FiatAmountText>
      </FeeContainer>
    </RowContainer>
  );
}

export default TransferFeeView;
