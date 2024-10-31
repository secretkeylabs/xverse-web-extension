import { BetterBarLoader } from '@components/barLoader';
import styled from 'styled-components';

const TilesLoaderContainer = styled.div<{
  $isGalleryOpen?: boolean;
}>((props) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  columnGap: props.$isGalleryOpen ? props.theme.space.xl : props.theme.space.m,
}));

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

export function TilesSkeletonLoader({
  className,
  tileSize = 151,
  isGalleryOpen,
}: {
  className?: string;
  tileSize?: number;
  isGalleryOpen?: boolean;
}) {
  return (
    <TilesLoaderContainer className={className} $isGalleryOpen={isGalleryOpen}>
      <TileLoaderContainer>
        <StyledBarLoader width={tileSize} height={tileSize} $withMarginBottom />
        <StyledBarLoader width={107} height={14} />
      </TileLoaderContainer>
      <TileLoaderContainer>
        <StyledBarLoader width={tileSize} height={tileSize} $withMarginBottom />
        <StyledBarLoader width={107} height={14} />
      </TileLoaderContainer>
    </TilesLoaderContainer>
  );
}
