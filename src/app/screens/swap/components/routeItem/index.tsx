import TokenImage from '@components/tokenImage';
import { CaretDown } from '@phosphor-icons/react';
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
  overflow: 'hidden',
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

type RouteItemProps = {
  label: string;
  token?: FungibleToken | 'BTC';
  onClick: () => void;
};

export default function RouteItem({ label, token, onClick }: RouteItemProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });

  return (
    <div>
      <StyledP typography="body_medium_m" color="white_400">
        {label}
      </StyledP>
      <RouteItemButtonContainer onClick={onClick}>
        {token && (
          <TokenImage
            currency={token === 'BTC' ? 'BTC' : 'FT'}
            fungibleToken={token === 'BTC' ? undefined : token}
            showProtocolIcon={false}
            size={20}
          />
        )}
        <TokenName typography="body_medium_m" color="white_0">
          {token === 'BTC' ? token : token?.name ?? t('SELECT_COIN')}
        </TokenName>
        <CaretDown size={12} weight="bold" color={Theme.colors.white_0} />
      </RouteItemButtonContainer>
    </div>
  );
}
