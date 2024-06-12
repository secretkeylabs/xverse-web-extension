import FiatAmountText from '@components/fiatAmountText';
import useWalletSelector from '@hooks/useWalletSelector';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: '12px 16px',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: props.theme.space.s,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

const SubValueText = styled.h1((props) => ({
  ...props.theme.typography.body_s,
  textAlign: 'right',
  color: props.theme.colors.white_400,
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

type Props = {
  title: string;
  subTitle?: string;
  value?: string | React.ReactNode;
  description?: string;
  subValue?: BigNumber;
};

function TransactionDetailComponent({ title, subTitle, value, subValue, description }: Props) {
  const { fiatCurrency } = useWalletSelector();

  return (
    <Container>
      <TitleContainer>
        <TitleText>{title}</TitleText>
        {subTitle && <SubValueText>{subTitle}</SubValueText>}
      </TitleContainer>
      <ColumnContainer>
        {value && <ValueText>{value}</ValueText>}
        {description && <SubValueText>{description}</SubValueText>}
        {subValue && <FiatAmountText fiatAmount={subValue} fiatCurrency={fiatCurrency} />}
      </ColumnContainer>
    </Container>
  );
}

export default TransactionDetailComponent;
