import { ChartLineUp, Gear, SketchLogo, Wallet } from '@phosphor-icons/react';
import { animated, easings, useSpring } from '@react-spring/web';
import { isInOptions } from '@utils/helper';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  minHeight: 64,
  justifyContent: 'space-between',
  paddingLeft: props.theme.spacing(30),
  paddingRight: props.theme.spacing(30),
  borderTop: `1px solid ${props.theme.colors.elevation3}`,
}));

const MovingDiv = styled(animated.div)((props) => ({
  width: 56,
  height: 32,
  backgroundColor: props.theme.colors.white_900,
  position: 'absolute',
  bottom: 18,
  left: 20,
  borderRadius: 16,
}));

const Button = styled.button({
  backgroundColor: 'transparent',
  zIndex: 2,
});

type Tab = 'dashboard' | 'nft' | 'stacking' | 'settings';

interface Props {
  tab: Tab;
}
function BottomTabBar({ tab }: Props) {
  const navigate = useNavigate();
  const theme = useTheme();

  const getPosition = () => {
    if (tab === 'nft') return 96;
    if (tab === 'stacking') return 168;
    if (tab === 'settings') return 240;
    return 24;
  };

  const styles = useSpring({
    from: { x: getPosition() }, // TODO: enable slide animation
    to: { x: getPosition() },
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

  const handleSettingButtonClick = () => {
    if (tab !== 'settings') {
      navigate('/settings');
    }
  };

  const showBottomBar = !isInOptions();

  return showBottomBar ? (
    <RowContainer>
      <MovingDiv style={styles} />
      <Button onClick={handleDashboardButtonClick}>
        <Wallet
          color={tab === 'dashboard' ? theme.colors.white_0 : theme.colors.white_600}
          size="24"
        />
      </Button>
      <Button onClick={handleNftButtonClick}>
        <SketchLogo
          color={tab === 'nft' ? theme.colors.white_0 : theme.colors.white_600}
          size="24"
        />
      </Button>
      <Button onClick={handleStackingButtonClick}>
        <ChartLineUp
          color={tab === 'stacking' ? theme.colors.white_0 : theme.colors.white_600}
          size="24"
        />
      </Button>
      <Button onClick={handleSettingButtonClick}>
        <Gear
          color={tab === 'settings' ? theme.colors.white_0 : theme.colors.white_600}
          size="24"
        />
      </Button>
    </RowContainer>
  ) : null;
}

export default BottomTabBar;
