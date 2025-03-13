import TokenTile from '@components/tokenTile';
import { getTrackingIdentifier } from '@screens/swap/utils';
import { AnalyticsEvents, type FungibleToken } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import { trackMixPanel } from '@utils/mixpanel';
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
  onSelectCoin: (token: FungibleToken) => void;
  onClose: () => void;
  to?: FungibleToken;
}

export default function TokenFromBottomSheet({ visible, title, onSelectCoin, onClose, to }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const fromTokens = useFromTokens(to);

  return (
    <Sheet visible={visible} title={title} onClose={onClose}>
      <Container>
        {fromTokens.map((token) => {
          if (token.principal === 'BTC') {
            return (
              <StyledTokenTile
                key={token.principal}
                title="Bitcoin"
                currency="BTC"
                onPress={() => {
                  onSelectCoin(token);
                  trackMixPanel(AnalyticsEvents.SelectTokenToSwapFrom, {
                    selectedToken: 'BTC',
                  });
                  onClose();
                }}
                hidePriceChange
              />
            );
          }
          if (token.principal === 'STX') {
            return (
              <StyledTokenTile
                key={token.principal}
                title="Stacks"
                currency="STX"
                onPress={() => {
                  onSelectCoin(token);
                  trackMixPanel(AnalyticsEvents.SelectTokenToSwapFrom, {
                    selectedToken: 'STX',
                    principal: 'STX',
                  });
                  onClose();
                }}
                hidePriceChange
              />
            );
          }
          if ((token.protocol === 'runes' || token.protocol === 'stacks') && 'principal' in token) {
            return (
              <StyledTokenTile
                key={token.principal}
                title={token.name}
                currency="FT"
                onPress={() => {
                  onSelectCoin(token);
                  trackMixPanel(AnalyticsEvents.SelectTokenToSwapFrom, {
                    selectedToken: getTrackingIdentifier(token),
                    principal: token.protocol === 'stacks' ? token.principal : undefined,
                  });
                  onClose();
                }}
                fungibleToken={token}
                hidePriceChange
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
