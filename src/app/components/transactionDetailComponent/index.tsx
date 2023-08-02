import styled from 'styled-components';
import { NumericFormat } from 'react-number-format';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { StoreState } from '@stores/index';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  background: props.theme.colors.background.elevation1,
  borderRadius: 12,
  padding: '12px 16px',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 12,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
}));

const SubValueText = styled.h1((props) => ({
  ...props.theme.body_m,
  fontSize: 12,
  textAlign: 'right',
  color: props.theme.colors.white[400],
}));

const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignItems: 'flex-end',
});

const TitleContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

interface Props {
  title: string;
  subTitle?: string;
  value?: string;
  description?: string;
  subValue?: BigNumber;
}

function TransactionDetailComponent({ title, subTitle, value, subValue, description }: Props) {
  const { fiatCurrency } = useSelector((state: StoreState) => state.walletState);

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
          prefix={`~ ${currencySymbolMap[fiatCurrency]} `}
          suffix={` ${fiatCurrency}`}
        />
      );
    }
    return '';
  };
  return (
    <Container>
      <TitleContainer>
        <TitleText>{title}</TitleText>
        {subTitle && <SubValueText>{subTitle}</SubValueText>}
      </TitleContainer>
      <ColumnContainer>
        {value && <ValueText>{value}</ValueText>}
        {description && <SubValueText>{description}</SubValueText>}
        {subValue && <SubValueText>{getFiatAmountString(subValue)}</SubValueText>}
      </ColumnContainer>
    </Container>
  );
}

export default TransactionDetailComponent;
