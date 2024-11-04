import { Copy } from '@phosphor-icons/react';
import { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import styled from 'styled-components';

const StyledToolTip = styled(Tooltip)`
  background-color: ${({ theme }) => theme.colors.white_0};
  color: #12151e;
  border-radius: ${({ theme }) => theme.radius(1)}px;
  padding: 7px;
`;

const AddressComponent = styled.p({
  width: '100%',
});

const AddressComponentTitle = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.xxs,
}));

const AddressComponentContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  gap: props.theme.space.xs,
}));

const AddressCompononentText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  wordBreak: 'break-all',
}));

const CopyButton = styled.button`
  display: flex;
  background: transparent;
  transition: opacity 0.1s ease;
  &:hover {
    opacity: 0.8;
  }
  &:active {
    opacity: 0.6;
  }
`;

type Props = {
  title: string;
  address?: string;
};

function LedgerAddressComponent({ title, address }: Props) {
  const [isCopied, setIsCopied] = useState(false);

  const handleClick = () => {
    if (!address) {
      return;
    }
    navigator.clipboard.writeText(address);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return address ? (
    <AddressComponent>
      <AddressComponentTitle>{title}</AddressComponentTitle>
      <AddressComponentContainer>
        <AddressCompononentText>{address}</AddressCompononentText>
        <CopyButton id={`${title}_anchor`} onClick={handleClick}>
          <Copy color="white" size={20} />
        </CopyButton>
        <StyledToolTip
          anchorId={`${title}_anchor`}
          variant="light"
          content={isCopied ? 'Copied' : title}
          events={['hover']}
          place="bottom"
          hidden={!isCopied}
        />
      </AddressComponentContainer>
    </AddressComponent>
  ) : null;
}

export default LedgerAddressComponent;
