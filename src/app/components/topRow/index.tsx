import { ArrowLeft, DotsThreeVertical, FadersHorizontal, Star } from '@phosphor-icons/react';
import type { MutableRefObject } from 'react';
import styled from 'styled-components';
import Theme from 'theme';

const TopSectionContainer = styled.div((props) => ({
  display: 'flex',
  minHeight: 20,
  margin: `${props.theme.space.l} ${props.theme.space.m}`,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
}));

const HeaderText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_m,
  paddingRight: props.theme.spacing(10),
}));

const BackButton = styled.button((props) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  backgroundColor: 'transparent',
  padding: 5,
  position: 'absolute',
  borderRadius: 24,
  left: 0,
  '&:hover': {
    backgroundColor: props.theme.colors.white_900,
  },
}));

const MenuButton = styled.button({
  display: 'flex',
  justifyContent: 'flex-end',
  backgroundColor: 'transparent',
  position: 'absolute',
  right: 0,
  opacity: 0.7,
  transition: 'opacity 0.1s ease',
  '&:hover': {
    opacity: 1,
  },
  '&:active': {
    opacity: 0.6,
  },
});

const StyledMenuButton = styled(MenuButton)<{ $marginRight: boolean }>`
  margin-right: ${(props) => (props.$marginRight ? '36px' : '0px')};
`;

type Props = {
  title?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  showBackButton?: boolean;
  className?: string;
  onMenuClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onSettingsClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  settingsRef?: MutableRefObject<HTMLButtonElement | null>;
  onStarClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isStarred?: boolean;
};

function TopRow({
  title,
  onClick,
  showBackButton = true,
  className,
  onMenuClick,
  onSettingsClick,
  settingsRef,
  onStarClick,
  isStarred,
}: Props) {
  return (
    <TopSectionContainer className={className}>
      {showBackButton && (
        <BackButton onClick={onClick} data-testid="back-button">
          <ArrowLeft size={20} color={Theme.colors.white_0} alt="back button" />
        </BackButton>
      )}
      {title && <HeaderText>{title}</HeaderText>}
      {onStarClick && (
        <StyledMenuButton onClick={onStarClick} $marginRight={Boolean(onMenuClick)}>
          {!isStarred && <Star size={20} color={Theme.colors.white_0} />}
          {isStarred && <Star size={20} color={Theme.colors.tangerine} weight="fill" />}
        </StyledMenuButton>
      )}
      {onMenuClick && (
        <MenuButton onClick={onMenuClick}>
          <DotsThreeVertical size={20} color={Theme.colors.white_0} weight="bold" />
        </MenuButton>
      )}
      {onSettingsClick && (
        <MenuButton onClick={onSettingsClick} ref={settingsRef}>
          <FadersHorizontal size={20} color={Theme.colors.white_200} />
        </MenuButton>
      )}
    </TopSectionContainer>
  );
}

export default TopRow;
