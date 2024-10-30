import TokenImage from '@components/tokenImage';
import { CaretDown } from '@phosphor-icons/react';
import { mapFtToCurrencyType, mapSwapTokenToFT } from '@screens/swap/utils';
import type { FungibleToken } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from 'theme';

const RouteItemButtonContainer = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: props.theme.space.xs,
  background: props.theme.colors.elevation_n1,
  alignItems: 'center',
  border: `1px solid ${props.theme.colors.white_800}`,
  borderRadius: props.theme.space.s,
  padding: `0 ${props.theme.space.m}`,
  marginTop: props.theme.space.xs,
  width: 135,
  height: 56,
  ':hover': {
    opacity: 0.8,
  },
}));

const TokenName = styled(StyledP)`
  flex: 1;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: left;
`;

type Props = {
  label: string;
  token?: FungibleToken;
  onClick: () => void;
};

export default function RouteItem({ label, token, onClick }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });

  const currency = mapFtToCurrencyType(token);

  return (
    <div>
      <StyledP typography="body_medium_m" color="white_400">
        {label}
      </StyledP>
      <RouteItemButtonContainer onClick={onClick}>
        {token && (
          <TokenImage
            currency={currency}
            fungibleToken={
              currency === 'FT'
                ? 'principal' in token
                  ? token
                  : mapSwapTokenToFT(token)
                : undefined
            }
            showProtocolIcon={false}
            size={20}
          />
        )}
        <TokenName data-testid="token-name" typography="body_medium_m" color="white_0">
          {currency !== 'FT'
            ? currency
            : token?.protocol === 'stacks'
            ? token?.ticker
            : token?.name ?? t('SELECT_COIN')}
        </TokenName>
        <CaretDown
          data-testid="down-arrow-button"
          size={12}
          weight="bold"
          color={Theme.colors.white_0}
        />
      </RouteItemButtonContainer>
    </div>
  );
}
