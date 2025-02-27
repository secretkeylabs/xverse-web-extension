import { ChartLineUp, Gear, Globe, SketchLogo, Wallet } from '@phosphor-icons/react';
import { AnalyticsEvents } from '@secretkeylabs/xverse-core';
import { isInOptions, type TabType } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

const BUTTON_WIDTH = 56;
const BUTTON_HEIGHT = 32;

const RowContainer = styled.div((props) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  minHeight: 64,
  justifyContent: 'space-between',
  paddingLeft: props.theme.space.xl,
  paddingRight: props.theme.space.xl,
}));

const MovingDiv = styled.div((props) => ({
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

type Props = {
  tab: TabType;
};

function BottomTabBar({ tab }: Props) {
  const navigate = useNavigate();
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerPadding = parseInt(theme.space.xl, 10);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
  }, []);

  const getPosition = () => {
    const gap = (containerWidth - 2 * containerPadding - 5 * BUTTON_WIDTH) / 4;

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

  const styles = {
    left: getPosition(), // TODO: enable slide animation
  };

  const handleDashboardButtonClick = () => {
    if (tab !== 'dashboard') {
      navigate('/');
    }
  };

  const handleNftButtonClick = () => {
    if (tab !== 'nft') {
      trackMixPanel(AnalyticsEvents.VisitCollectiblesTab);
      navigate('/nft-dashboard');
    }
  };

  const handleStackingButtonClick = () => {
    if (tab !== 'stacking') {
      trackMixPanel(AnalyticsEvents.VisitStackingTab);
      navigate('/stacking');
    }
  };

  const handleExploreButtonClick = () => {
    if (tab !== 'explore') {
      trackMixPanel(AnalyticsEvents.VisitExplorePage);
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
    <RowContainer ref={containerRef}>
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
