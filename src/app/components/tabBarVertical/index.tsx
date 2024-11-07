import { ChartLineUp, Gear, Globe, SketchLogo, Wallet } from '@phosphor-icons/react';
import type { TabType } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

const Container = styled.div((props) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: props.theme.space.s,
  width: 96,
  height: '100%',
  minHeight: '100vh',
  padding: `${props.theme.space.l} ${props.theme.space.s}`,
  borderRight: `1px solid ${props.theme.colors.white_900}`,
}));

const StyledLink = styled(Link)<{ $isActive: boolean }>((props) => ({
  ...props.theme.typography.body_medium_s,
  fontSize: 10,
  zIndex: 2,
  width: 72,
  height: 64,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: props.theme.space.xxs,
  borderRadius: 16,
  color: props.$isActive ? props.theme.colors.white_0 : props.theme.colors.white_400,
  backgroundColor: props.$isActive ? props.theme.colors.white_900 : 'transparent',
}));

type Props = {
  tab: TabType;
  className?: string;
};

function VerticalTabBar({ tab, className }: Props) {
  const theme = useTheme();
  const { t } = useTranslation('translation', { keyPrefix: 'COMMON' });

  return (
    <Container className={className}>
      <StyledLink to="/" data-testid="nav-dashboard" $isActive={tab === 'dashboard'}>
        <Wallet
          size="24"
          color={tab === 'dashboard' ? theme.colors.white_0 : theme.colors.white_600}
        />
        {t('DASHBOARD')}
      </StyledLink>
      <StyledLink to="/nft-dashboard" data-testid="nav-nft" $isActive={tab === 'nft'}>
        <SketchLogo
          color={tab === 'nft' ? theme.colors.white_0 : theme.colors.white_600}
          size="24"
        />
        {t('COLLECTIBLES')}
      </StyledLink>
      <StyledLink to="/stacking" data-testid="nav-stacking" $isActive={tab === 'stacking'}>
        <ChartLineUp
          color={tab === 'stacking' ? theme.colors.white_0 : theme.colors.white_600}
          size="24"
        />
        {t('EARN')}
      </StyledLink>
      <StyledLink to="/explore" data-testid="nav-explore" $isActive={tab === 'explore'}>
        <Globe
          color={tab === 'explore' ? theme.colors.white_0 : theme.colors.white_600}
          size="24"
        />
        {t('EXPLORE')}
      </StyledLink>
      <StyledLink to="/settings" data-testid="nav-settings" $isActive={tab === 'settings'}>
        <Gear
          color={tab === 'settings' ? theme.colors.white_0 : theme.colors.white_600}
          size="24"
        />
        {t('SETTINGS')}
      </StyledLink>
    </Container>
  );
}

export default VerticalTabBar;
