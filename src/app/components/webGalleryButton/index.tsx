import { SquaresFour } from '@phosphor-icons/react';
import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const StyledButton = styled.button`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${(props) => props.theme.space.xs};
  background-color: transparent;
  color: ${(props) => props.theme.colors.white_0};
  :hover:enabled {
    color: ${(props) => props.theme.colors.white_200};
  }
  :active ;
  :disabled {
    color: ${(props) => props.theme.colors.white_400};
  }
  svg {
    flex-grow: 0;
    flex-shrink: 0;
  }
`;

export function WebGalleryButton({
  className,
  onClick,
}: {
  className?: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
  const { t } = useTranslation('translation');
  return (
    <StyledButton className={className} onClick={onClick}>
      <SquaresFour weight="bold" size={16} color="currentColor" />
      <StyledP typography="body_medium_m">{t('NFT_DETAIL_SCREEN.WEB_GALLERY')}</StyledP>
    </StyledButton>
  );
}
export default WebGalleryButton;
