import { StyledBarLoader, TilesSkeletonLoader } from '@components/tilesSkeletonLoader';
import { CountLoaderContainer, LoaderContainer } from './index.styled';

function SkeletonLoader({ isGalleryOpen }: { isGalleryOpen: boolean }) {
  return (
    <LoaderContainer>
      <CountLoaderContainer>
        <StyledBarLoader width={85} height={20} />
      </CountLoaderContainer>
      <TilesSkeletonLoader isGalleryOpen={isGalleryOpen} tileSize={isGalleryOpen ? 276 : 151} />
    </LoaderContainer>
  );
}

export default SkeletonLoader;
