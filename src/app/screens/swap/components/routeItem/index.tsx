import { CaretDown } from '@phosphor-icons/react';
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
  padding: props.theme.space.m,
  marginTop: props.theme.space.xs,
  maxWidth: 135,
  ':hover': {
    opacity: 0.8,
  },
}));

type RouteItemProps = {
  label: string;
  onClick: () => void;
  // TODO: extend interface to handle selected token when from bottomsheet is ready
};

export default function RouteItem({ label, onClick }: RouteItemProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });

  return (
    <div>
      <StyledP typography="body_medium_m" color="white_400">
        {label}
      </StyledP>
      <RouteItemButtonContainer onClick={onClick}>
        <StyledP typography="body_medium_m" color="white_0">
          {t('SELECT_COIN')}
        </StyledP>
        <CaretDown size={12} weight="bold" color={Theme.colors.white_0} />
      </RouteItemButtonContainer>
    </div>
  );
}
