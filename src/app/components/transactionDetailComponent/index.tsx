import { StyledFiatAmountText } from '@components/fiatAmountText';
import useWalletSelector from '@hooks/useWalletSelector';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  background: props.theme.colors.elevation1,
  borderRadius: props.theme.radius(2),
  padding: props.theme.space.m,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: props.theme.space.s,
}));

const TitleText = styled.p<{ $color?: string }>((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.$color ? props.theme.colors[props.$color] : props.theme.colors.white_400,
}));

const ValueText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

const SubValueText = styled.p((props) => ({
  ...props.theme.typography.body_medium_s,
  textAlign: 'right',
  color: props.theme.colors.white_400,
  marginTop: props.theme.space.xxxs,
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

const FiatText = styled(StyledFiatAmountText)((props) => ({
  marginTop: props.theme.space.xxxs,
}));

type Props = {
  title: string;
  subTitle?: string;
  value?: string | React.ReactNode;
  description?: string;
  subValue?: BigNumber;
  titleColor?: string;
};

function TransactionDetailComponent({
  title,
  subTitle,
  value,
  subValue,
  description,
  titleColor,
}: Props) {
  const { fiatCurrency } = useWalletSelector();
  return (
    <Container>
      <TitleContainer>
        <TitleText $color={titleColor}>{title}</TitleText>
        {subTitle && <SubValueText>{subTitle}</SubValueText>}
      </TitleContainer>
      <ColumnContainer>
        {value && <ValueText>{value}</ValueText>}
        {description && <SubValueText>{description}</SubValueText>}
        {subValue && <FiatText fiatAmount={subValue} fiatCurrency={fiatCurrency} />}
      </ColumnContainer>
    </Container>
  );
}

export default TransactionDetailComponent;
