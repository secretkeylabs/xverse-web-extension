import { animated, useSpring } from '@react-spring/web';
import { ANIMATION_EASING, LoaderSize } from '@utils/constants';
import ContentLoader from 'react-content-loader';
import styled from 'styled-components';
import Theme from 'theme';

function getHeight(loaderSize?: LoaderSize) {
  switch (loaderSize) {
    case LoaderSize.SMALLEST:
      return 10;
    case LoaderSize.SMALL:
      return 15;
    case LoaderSize.MEDIUM:
      return 25;
    case LoaderSize.LARGE:
      return 35;
    default:
      return 15;
  }
}

function getWidth(loaderSize?: LoaderSize) {
  switch (loaderSize) {
    case LoaderSize.SMALLEST:
      return 120;
    case LoaderSize.SMALL:
      return 150;
    case LoaderSize.MEDIUM:
      return 250;
    case LoaderSize.LARGE:
      return 300;
    default:
      return 100;
  }
}

function getRadius(loaderSize?: LoaderSize) {
  switch (loaderSize) {
    case LoaderSize.SMALL:
      return 5;
    case LoaderSize.MEDIUM:
      return 10;
    case LoaderSize.LARGE:
      return 15;
    default:
      return 5;
  }
}

function BarLoader({ loaderSize }: { loaderSize?: LoaderSize }) {
  return (
    <ContentLoader
      animate
      speed={1}
      interval={0.1}
      viewBox="0 0 380 40"
      backgroundColor={Theme.colors.elevation3}
      foregroundColor={Theme.colors.grey}
    >
      <rect
        y="0"
        x="0"
        rx={getRadius(loaderSize)}
        ry={getRadius(loaderSize)}
        width={getWidth(loaderSize)}
        height={getHeight(loaderSize)}
      />
    </ContentLoader>
  );
}
export default BarLoader;

const StyledContentLoader = styled(ContentLoader)`
  padding: ${(props) => props.theme.space.xxxs}px;
`;

export function BetterBarLoader({
  width,
  height,
  className,
}: {
  width: number | string;
  height: number | string;
  className?: string;
}) {
  return (
    <StyledContentLoader
      animate
      speed={1}
      interval={0.1}
      width={width}
      height={height}
      backgroundColor={Theme.colors.elevation3}
      foregroundColor={Theme.colors.grey}
      className={className}
    >
      <rect y="0" x="0" rx="2" ry="2" width={width} height={height} />
    </StyledContentLoader>
  );
}

export function BestBarLoader({
  width,
  height,
  className,
}: {
  width: number | string;
  height: number | string;
  className?: string;
}) {
  const styles = useSpring({
    from: {
      backgroundColor: Theme.colors.white_850,
    },
    to: {
      backgroundColor: Theme.colors.white_800,
    },
    loop: { reverse: true },
    config: {
      duration: 400,
      easing: ANIMATION_EASING,
    },
  });

  return <animated.div style={{ ...styles, width, height }} className={className} />;
}
