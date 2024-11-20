import { BetterBarLoader } from '@components/barLoader';
import styled from 'styled-components';

const TileLoaderContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

export const StyledBarLoader = styled(BetterBarLoader)<{
  $withMarginBottom?: boolean;
  $isGalleryOpen?: boolean;
}>((props) => ({
  padding: 0,
  borderRadius: props.theme.radius(props.$isGalleryOpen ? 3 : 1),
  marginBottom: props.$withMarginBottom ? props.theme.space.s : 0,
}));

const LOADER_COUNT = 9;

export function TilesSkeletonLoader({
  tileSize = 151,
  isGalleryOpen,
}: {
  tileSize?: number;
  isGalleryOpen?: boolean;
}) {
  return (
    <>
      {[...Array(LOADER_COUNT)].map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <TileLoaderContainer key={index}>
          <StyledBarLoader
            width={tileSize}
            height={tileSize}
            $isGalleryOpen={isGalleryOpen}
            $withMarginBottom
          />
          <StyledBarLoader width={107} height={14} />
        </TileLoaderContainer>
      ))}
    </>
  );
}
