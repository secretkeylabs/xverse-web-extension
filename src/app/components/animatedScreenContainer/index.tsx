import ScreenContainer from '@components/screenContainer';
import { animated, useSpring } from '@react-spring/web';
import { ANIMATION_EASING } from '@utils/constants';
import { useLocation } from 'react-router-dom';

const containerStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  height: '100%',
  minHeight: '100vh',
};

function AnimatedScreenContainer(): JSX.Element {
  const location = useLocation();
  const { state } = location;

  const shouldAnimate = state?.from === '/login';

  const styles = useSpring({
    from: {
      y: '125%',
    },
    to: {
      y: '0%',
    },
    delay: shouldAnimate ? 300 : 0,
    config: {
      duration: shouldAnimate ? 450 : 0,
      easing: ANIMATION_EASING,
    },
  });

  return (
    <animated.div
      style={{
        ...styles,
        ...containerStyles,
      }}
    >
      <ScreenContainer isSidebarVisible />
    </animated.div>
  );
}

export default AnimatedScreenContainer;
