import styled from 'styled-components';
import { getTruncatedAddress } from '@utils/helper';
import { ReactNode } from 'react';
import CopyButton from '@components/copyButton';
import useWalletSelector from '@hooks/useWalletSelector';

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
  icon?: string;
  title?: string;
  amount?: string;
  children?: ReactNode;
  address: string;
  hideAddress?: boolean;
  hideCopyButton?: boolean;
}

function TransferDetailView({
  icon, title, amount, children, address, hideAddress, hideCopyButton,
}: Props) {
  return (
    <RowContainer>
      {icon && <Icon src={icon} />}
      {amount ? (
        <ColumnContainer>
          <AmountText>{amount}</AmountText>
          {children}
        </ColumnContainer>
      )
        : <TitleText>{title}</TitleText>}
      <AddressContainer>
        {!hideAddress && <ValueText>{getTruncatedAddress(address)}</ValueText>}
        {!hideCopyButton && <CopyButton text={address} /> }
      </AddressContainer>
    </RowContainer>
  );
}

export default TransferDetailView;
