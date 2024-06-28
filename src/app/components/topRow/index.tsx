import { ArrowLeft, DotsThreeVertical } from '@phosphor-icons/react';
import styled from 'styled-components';
import Theme from 'theme';

const TopSectionContainer = styled.div((props) => ({
  display: 'flex',
  minHeight: 18,
  marginTop: props.theme.space.l,
  marginBottom: props.theme.spacing(9),
  marginLeft: props.theme.space.m,
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

const MenuButton = styled.button((props) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  backgroundColor: 'transparent',
  padding: props.theme.space.xxs,
  position: 'absolute',
  right: props.theme.space.xxs,
}));

interface Props {
  title?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  showBackButton?: boolean;
  className?: string;
  onMenuClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function TopRow({ title, onClick, showBackButton = true, className, onMenuClick }: Props) {
  return (
    <TopSectionContainer className={className}>
      {showBackButton && (
        <BackButton onClick={onClick} data-testid="back-button">
          <ArrowLeft size={20} color={Theme.colors.white_0} alt="back button" />
        </BackButton>
      )}
      {title && <HeaderText>{title}</HeaderText>}
      {onMenuClick && (
        <MenuButton onClick={onMenuClick}>
          <DotsThreeVertical size={20} color={Theme.colors.white_200} />
        </MenuButton>
      )}
    </TopSectionContainer>
  );
}

export default TopRow;
