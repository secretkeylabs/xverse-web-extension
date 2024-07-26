import TokenTile from '@components/tokenTile';
import type { FungibleToken, Token } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import useFromTokens from './useFromTokens';

const Container = styled.div((props) => ({
  marginTop: props.theme.space.xs,
  marginBottom: props.theme.space.xxl,
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.xl,
}));

const StyledTokenTile = styled(TokenTile)`
  padding: 0;
  background-color: transparent;
`;

interface Props {
  visible: boolean;
  title: string;
  onSelectCoin: (token: FungibleToken | 'BTC') => void;
  onClose: () => void;
  to?: Token;
}

export default function TokenFromBottomSheet({ visible, title, onSelectCoin, onClose, to }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const fromTokens = useFromTokens(to);

  return (
    <Sheet visible={visible} title={title} onClose={onClose}>
      <Container>
        {fromTokens.map((token) => {
          if (token === 'BTC') {
            return (
              <StyledTokenTile
                key={token}
                title="Bitcoin"
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
              />
            );
          }
          return null;
        })}
        {!!(fromTokens.length === 0) && !fromTokens && (
          <StyledP typography="body_m" color="white_200">
            {t('ERRORS.NO_TOKENS_FOUND')}
          </StyledP>
        )}
      </Container>
    </Sheet>
  );
}
