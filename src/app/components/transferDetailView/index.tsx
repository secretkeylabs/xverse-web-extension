import styled from 'styled-components';
import { getTruncatedAddress } from '@utils/helper';
import { ReactNode } from 'react';
import CopyButton from '@components/copyButton';

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
});

const Icon = styled.img((props) => ({
  marginRight: props.theme.spacing(4),
  width: 32,
  height: 32,
  borderRadius: 30,
}));

const AddressContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-end',
});

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
}));

const AmountText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
}));

const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

interface Props {
  icon: string;
  title?: string;
  amount?: string;
  fiatAmount?: ReactNode;
  address: string;
}

function TransferDetailView({
  icon, title, amount, fiatAmount, address,
}: Props) {
  return (
    <RowContainer>
      <Icon src={icon} />
      {amount ? (
        <ColumnContainer>
          <AmountText>{amount}</AmountText>
          {fiatAmount}
        </ColumnContainer>
      )
        : <TitleText>{title}</TitleText>}
      <AddressContainer>
        <ValueText>{getTruncatedAddress(address)}</ValueText>
        <CopyButton text={address} />
      </AddressContainer>
    </RowContainer>
  );
}

export default TransferDetailView;
