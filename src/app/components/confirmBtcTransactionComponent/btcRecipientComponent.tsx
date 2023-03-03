import TransferDetailView from '@components/transferDetailView';
import OutputIcon from '@assets/img/transactions/output.svg';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import { StoreState } from '@stores/index';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.background.elevation1,
  borderRadius: 12,
  padding: '16px 16px',
  justifyContent: 'center',
  marginBottom: 12,
}));

const RecipientTitleText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white[200],
  marginBottom: 22,
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',

  marginBottom: 22,
});

const Icon = styled.img((props) => ({
  marginRight: props.theme.spacing(4),
  width: 32,
  height: 32,
  borderRadius: 30,
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
  color: props.theme.colors.white[400],
}));

const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
});

interface Props {
  recipientIndex?: number;
  address: string;
  value: string;
  subValue?: BigNumber;
  totalRecipient?: number;
  icon: string;
  title: string;

}
function BtcRecipientComponent({
  recipientIndex, address, value, totalRecipient, subValue, icon, title,
} : Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const {
    fiatCurrency,
  } = useSelector((state: StoreState) => state.walletState);

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
          renderText={(text) => <SubValueText>{text}</SubValueText>}
        />
      );
    }
    return '';
  };

  return (
    <Container>
      {recipientIndex && totalRecipient && <RecipientTitleText>{`${t('RECIPIENT')} ${recipientIndex}/${totalRecipient}`}</RecipientTitleText>}
      <RowContainer>
        <Icon src={icon} />
        <TitleText>{title}</TitleText>
        <ColumnContainer>
          <ValueText>{value}</ValueText>
          {subValue && <SubValueText>{getFiatAmountString(subValue)}</SubValueText>}
        </ColumnContainer>
      </RowContainer>
      <TransferDetailView icon={OutputIcon} title={t('RECIPIENT')} address={address} />
    </Container>
  );
}

export default BtcRecipientComponent;
