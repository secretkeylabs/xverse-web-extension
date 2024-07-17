import TokenTile from '@components/tokenTile';
import type { FungibleToken } from '@secretkeylabs/xverse-core';
import Sheet from '@ui-library/sheet';
import Spinner from '@ui-library/spinner';
import styled from 'styled-components';
import useFromTokens from './useFromTokens';

const Container = styled.div((props) => ({
  marginTop: props.theme.space.xs,
  marginBottom: props.theme.space.xxl,
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.xl,
}));

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledTokenTile = styled(TokenTile)`
  padding: 0;
  background-color: transparent;
`;

interface Props {
  visible: boolean;
  title: string;
  onSelectCoin: (token: FungibleToken | 'BTC') => void;
  onClose: () => void;
}

export default function TokenFromBottomSheet({ visible, title, onSelectCoin, onClose }: Props) {
  const { data, isLoading } = useFromTokens();

  return (
    <Sheet visible={visible} title={title} onClose={onClose}>
      <Container>
        {isLoading && (
          <SpinnerContainer>
            <Spinner size={20} />
          </SpinnerContainer>
        )}
        {!!(data && !isLoading) &&
          data.map((token) => {
            if (token === 'BTC') {
              return (
                <StyledTokenTile
                  key={token}
                  title={token}
                  currency="BTC"
                  onPress={() => {
                    onSelectCoin(token);
                    onClose();
                  }}
                />
              );
            }
            if (token.protocol === 'runes' && 'principal' in token) {
              return (
                <StyledTokenTile
                  key={token.principal}
                  title={token.name}
                  currency="FT"
                  onPress={() => {
                    onSelectCoin(token);
                    onClose();
                  }}
                  fungibleToken={token}
                  showProtocolIcon={false}
                />
              );
            }
            return null;
          })}
      </Container>
    </Sheet>
  );
}
