import { ChartLineUp, Gear, Globe, SketchLogo, Wallet } from '@phosphor-icons/react';
import { animated, easings, useSpring } from '@react-spring/web';
import { isInOptions } from '@utils/helper';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

const BUTTON_WIDTH = 56;
const BUTTON_HEIGHT = 32;

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  minHeight: 64,
  justifyContent: 'space-between',
  paddingLeft: props.theme.space.xl,
  paddingRight: props.theme.space.xl,
}));

const MovingDiv = styled(animated.div)((props) => ({
  width: BUTTON_WIDTH,
  height: BUTTON_HEIGHT,
  backgroundColor: props.theme.colors.white_900,
  position: 'absolute',
  bottom: BUTTON_HEIGHT / 2,
  borderRadius: 16,
}));

const Button = styled.button({
  zIndex: 2,
  width: BUTTON_WIDTH,
  height: BUTTON_HEIGHT,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 16,
  backgroundColor: 'transparent',
});

export type Tab = 'dashboard' | 'nft' | 'stacking' | 'explore' | 'settings';

type Props = {
  tab: Tab;
};

function BottomTabBar({ tab }: Props) {
  const navigate = useNavigate();
  const theme = useTheme();

  const getPosition = () => {
    const containerPadding = parseInt(theme.space.xl, 10);
    const gap = (window.innerWidth - 2 * containerPadding - 5 * BUTTON_WIDTH) / 4;

    switch (tab) {
      case 'nft':
        return containerPadding + BUTTON_WIDTH + gap;
      case 'stacking':
        return containerPadding + 2 * (BUTTON_WIDTH + gap);
      case 'explore':
        return containerPadding + 3 * (BUTTON_WIDTH + gap);
      case 'settings':
        return containerPadding + 4 * (BUTTON_WIDTH + gap);
      default: // 'dashboard'
        return containerPadding;
    }
  };

  const styles = useSpring({
    left: getPosition(), // TODO: enable slide animation
    config: {
      duration: 200,
      easing: easings.easeOutCirc,
    },
  });

  const handleDashboardButtonClick = () => {
    if (tab !== 'dashboard') {
      navigate('/');
    }
  };

  const handleNftButtonClick = () => {
    if (tab !== 'nft') {
      navigate('/nft-dashboard');
    }
  };

  const handleStackingButtonClick = () => {
    if (tab !== 'stacking') {
      navigate('/stacking');
    }
  };

  const handleExploreButtonClick = () => {
    if (tab !== 'explore') {
      navigate('/explore');
    }
  };

  const handleSettingButtonClick = () => {
    if (tab !== 'settings') {
      navigate('/settings');
    }
  };

  const showBottomBar = !isInOptions();

  return showBottomBar ? (
    <RowContainer>
      <MovingDiv style={styles} />
      <Button data-testid="nav-dashboard" onClick={handleDashboardButtonClick}>
        <Wallet
          color={tab === 'dashboard' ? theme.colors.white_0 : theme.colors.white_600}
          size="24"
        />
      </Button>
      <Button data-testid="nav-nft" onClick={handleNftButtonClick}>
        <SketchLogo
          color={tab === 'nft' ? theme.colors.white_0 : theme.colors.white_600}
          size="24"
        />
      </Button>
      <Button data-testid="nav-stacking" onClick={handleStackingButtonClick}>
        <ChartLineUp
          color={tab === 'stacking' ? theme.colors.white_0 : theme.colors.white_600}
          size="24"
        />
      </Button>
      <Button data-testid="nav-explore" onClick={handleExploreButtonClick}>
        <Globe
          color={tab === 'explore' ? theme.colors.white_0 : theme.colors.white_600}
          size="24"
        />
      </Button>
      <Button data-testid="nav-settings" onClick={handleSettingButtonClick}>
        <Gear
          color={tab === 'settings' ? theme.colors.white_0 : theme.colors.white_600}
          size="24"
        />
      </Button>
    </RowContainer>
  ) : null;
}

export default BottomTabBar;
