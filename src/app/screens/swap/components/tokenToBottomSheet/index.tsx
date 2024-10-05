import TokenTile from '@components/tokenTile';
import useDebounce from '@hooks/useDebounce';
import { MagnifyingGlass } from '@phosphor-icons/react';
import {
  isStxTx,
  mapFTMotherProtocolToSwapProtocol,
  mapFTProtocolToSwapProtocol,
  mapSwapProtocolToFTProtocol,
  mapSwapTokenToFT,
} from '@screens/swap/utils';
import {
  AnalyticsEvents,
  type FungibleToken,
  type Protocol,
  type Token,
  type TokenBasic,
} from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Input from '@ui-library/input';
import Sheet from '@ui-library/sheet';
import Spinner from '@ui-library/spinner';
import { trackMixPanel } from '@utils/mixpanel';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from 'theme';
import useToTokens from './useToTokens';

const Container = styled.div`
  margin-top: ${(props) => props.theme.space.xs};
  margin-bottom: ${(props) => props.theme.space.xxl};
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.xl};
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledTokenTile = styled(TokenTile)`
  padding: 0;
  background-color: transparent;
`;

const ProtocolList = styled.div`
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
  gap: ${(props) => props.theme.space.xxs};
  &::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
`;

const ProtocolItem = styled.button<{ selected: boolean }>`
  ${(props) => props.theme.typography.body_bold_s}
  padding: ${(props) => props.theme.space.xs} ${(props) => props.theme.space.s};
  display: inline-block;
  background-color: ${({ selected, theme }) =>
    selected ? theme.colors.elevation6 : 'transparent'};
  color: ${(props) => props.theme.colors.white_0};
  border: none;
  border-radius: ${(props) => props.theme.space.s};
  cursor: ${({ selected }) => (selected ? 'default' : 'pointer')};
  white-space: nowrap;
  flex: 0 0 auto;
  text-transform: uppercase;
  &:hover {
    background-color: ${({ selected, theme }) =>
      selected ? theme.colors.elevation6 : theme.colors.elevation2};
  }
`;

interface Props {
  visible: boolean;
  title: string;
  from?: FungibleToken;
  onSelectCoin: (token: Token) => void;
  onClose: () => void;
  resetFrom: () => void;
}

const supportedProtocols: Protocol[] = ['runes', 'sip10']; // add more protocols here

const mapProtocolName = (protocol: Protocol) => {
  if (protocol === 'sip10') return 'SIP-10';
  return protocol.toUpperCase();
};

export default function TokenToBottomSheet({
  visible,
  title,
  from,
  onSelectCoin,
  onClose,
  resetFrom,
}: Props) {
  const [query, setQuery] = useState('');

  const [selectedProtocol, setSelectedProtocol] = useState<Protocol>(supportedProtocols[0]);

  useEffect(() => {
    if (from) {
      setSelectedProtocol(mapFTMotherProtocolToSwapProtocol(from));
    }
  }, [from, visible]);

  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const search = useDebounce(query, 500);
  const fromTokenBasic: TokenBasic | undefined = from
    ? {
        protocol: mapFTProtocolToSwapProtocol(from),
        ticker: from.principal,
      }
    : undefined;
  const { data, error, isLoading } = useToTokens(selectedProtocol, fromTokenBasic, search);

  const onChangeProtocol = (protocol: Protocol) => () => {
    if (selectedProtocol === protocol) {
      return;
    }
    resetFrom();
    setQuery('');
    setSelectedProtocol(protocol);
  };

  const handleClose = () => {
    setQuery('');
    setSelectedProtocol(supportedProtocols[0]);
    onClose();
  };

  return (
    <Sheet visible={visible} title={title} onClose={handleClose}>
      <Container>
        <div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            bgColor={Theme.colors.elevation1}
            placeholder={t('SEARCH_BY_NAME')}
            leftAccessory={{
              icon: <MagnifyingGlass size={16} weight="bold" color={Theme.colors.white_400} />,
            }}
          />
          {supportedProtocols.length > 1 && (
            <ProtocolList>
              {supportedProtocols.map((key) => (
                <ProtocolItem
                  key={key}
                  selected={key === selectedProtocol}
                  onClick={onChangeProtocol(key)}
                >
                  {mapProtocolName(key)}
                </ProtocolItem>
              ))}
            </ProtocolList>
          )}
        </div>
        {isLoading && (
          <SpinnerContainer>
            <Spinner size={20} />
          </SpinnerContainer>
        )}
        {!!(data && !isLoading) &&
          data.map((token) => {
            if (token.protocol === 'btc' && selectedProtocol === 'runes') {
              return (
                <StyledTokenTile
                  key={token.name}
                  title={token.name ?? token.ticker}
                  currency="BTC"
                  onPress={() => {
                    onSelectCoin(token);
                    trackMixPanel(AnalyticsEvents.SelectTokenToSwapTo, {
                      selectedToken: 'BTC',
                    });
                    handleClose();
                  }}
                  hideBalance
                />
              );
            }
            if (token.protocol === 'stx' && selectedProtocol === 'sip10') {
              return (
                <StyledTokenTile
                  key={token.name}
                  title={token.name ?? token.ticker}
                  currency="STX"
                  onPress={() => {
                    onSelectCoin(token);
                    trackMixPanel(AnalyticsEvents.SelectTokenToSwapTo, {
                      selectedToken: 'STX',
                      principal: 'STX',
                    });
                    handleClose();
                  }}
                  hideBalance
                />
              );
            }
            if (token.protocol === 'runes' || token.protocol === 'sip10') {
              return (
                <StyledTokenTile
                  key={token.ticker}
                  title={token.name ?? token.ticker}
                  currency="FT"
                  onPress={() => {
                    onSelectCoin(token);
                    trackMixPanel(AnalyticsEvents.SelectTokenToSwapTo, {
                      selectedToken: token.name ?? token.ticker,
                      principal: isStxTx({ toToken: token }) ? token.ticker : undefined,
                    });
                    handleClose();
                  }}
                  fungibleToken={mapSwapTokenToFT(token)}
                  hideBalance
                />
              );
            }
            return null;
          })}
        {!!(data?.length === 0 || error) && !isLoading && (
          <StyledP typography="body_m" color="white_200">
            {t('ERRORS.NO_TOKENS_FOUND')}
          </StyledP>
        )}
      </Container>
    </Sheet>
  );
}
