import BigNumber from 'bignumber.js';
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

interface Props {
  amount: BigNumber;
  currency : string;
}

function TransferAmountView({ amount, currency }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
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
    </SendAmountContainer>
  );
}

export default TransferAmountView;
