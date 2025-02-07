import { StyledBarLoader, TilesSkeletonLoader } from '@components/tilesSkeletonLoader';
import { CountLoaderContainer, GridContainer, LoaderContainer } from './index.styled';

function SkeletonLoader({ isGalleryOpen }: { isGalleryOpen: boolean }) {
  return (
    <LoaderContainer>
      <CountLoaderContainer>
        <StyledBarLoader width={85} height={20} />
      </CountLoaderContainer>
      <GridContainer $isGalleryOpen={isGalleryOpen}>
        <TilesSkeletonLoader isGalleryOpen={isGalleryOpen} tileSize={isGalleryOpen ? 171 : 151} />
      </GridContainer>
    </LoaderContainer>
  );
}

export default SkeletonLoader;
