import TokenImage from '@components/tokenImage';
import type { FungibleToken } from '@secretkeylabs/xverse-core';
import Toggle from '@ui-library/toggle';
import { useState } from 'react';
import styled from 'styled-components';

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${(props) => props.theme.space.m} 0;
`;

const CoinContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const CoinTitleText = styled.p<{ $isEnabled?: boolean }>((props) => ({
  ...props.theme.typography[props.$isEnabled ? 'body_bold_m' : 'body_m'],
  color: props.theme.colors[props.$isEnabled ? 'white_0' : 'white_400'],
  textAlign: 'left',
  marginLeft: props.theme.space.m,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '200px',
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical',
}));

interface Props {
  id: string;
  name: string;
  image?: string;
  ticker?: string;
  runeSymbol?: string | null;
  runeInscriptionId?: string | null;
  protocol?: string;
  disabled: boolean;
  toggled(enabled: boolean, coinName: string, coinKey: string): void;
  enabled?: boolean;
}

function CoinItem({
  id,
  name,
  image,
  ticker,
  runeInscriptionId,
  runeSymbol,
  protocol,
  disabled,
  toggled,
  enabled,
}: Props) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const toggleSwitch = () => {
    setIsEnabled((previousState) => !previousState);
    toggled(!isEnabled, name, id);
  };

  return (
    <RowContainer aria-label="Token Row" data-testid={name}>
      <CoinContainer>
        <TokenImage
          fungibleToken={
            {
              name,
              ticker,
              image,
              runeInscriptionId,
              runeSymbol,
              protocol,
            } as FungibleToken
          }
          size={32}
        />
        <CoinTitleText aria-label="Coin Title" $isEnabled={isEnabled}>
          {name}
        </CoinTitleText>
      </CoinContainer>
      <Toggle onChange={toggleSwitch} checked={isEnabled!} disabled={disabled} />
    </RowContainer>
  );
}

export default CoinItem;
