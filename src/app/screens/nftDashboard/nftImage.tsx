import { BetterBarLoader } from '@components/barLoader';
import { SquareLogo } from '@phosphor-icons/react';
import type { TokenMetaData } from '@secretkeylabs/xverse-core';
import { POPUP_WIDTH } from '@utils/constants';
import { getFetchableUrl } from '@utils/helper';
import Image from 'rc-image';
import { Suspense, useState } from 'react';
import styled from 'styled-components';
import Theme from 'theme';

interface ContainerProps {
  isGalleryOpen: boolean;
}

const ImageContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  borderRadius: props.theme.radius(2),
  aspectRatio: '1',
}));

const LoaderContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  width: '100%',
  left: 0,
  bottom: 0,
  right: 0,
  top: 0,
});

const StyledBarLoader = styled(BetterBarLoader)((props) => ({
  padding: 0,
  borderRadius: props.theme.radius(1),
}));

const Video = styled.video({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 8,
});

const StyledImg = styled(Image)`
  border-radius: ${({ theme }) => theme.radius(2)}px;
  object-fit: contain;
`;

type Props = {
  metadata?: TokenMetaData;
  isInCollage?: boolean;
};

function ErrorStateImg() {
  return <SquareLogo width="40%" height="40%" weight="light" color={Theme.colors.elevation6} />;
}

function NftImage({ metadata, isInCollage = false }: Props) {
  const [error, setError] = useState(false);
  const isGalleryOpen: boolean = document.documentElement.clientWidth > POPUP_WIDTH;

  if (metadata?.image_protocol) {
    return (
      <ImageContainer isGalleryOpen={isGalleryOpen || isInCollage}>
        {error ? (
          <ErrorStateImg />
        ) : (
          <Suspense>
            <StyledImg
              width="100%"
              preview={false}
              src={getFetchableUrl(metadata.image_url ?? '', metadata.image_protocol ?? '')}
              placeholder={
                <LoaderContainer>
                  <StyledBarLoader width="100%" height="100%" />
                </LoaderContainer>
              }
              onError={() => setError(true)}
            />
          </Suspense>
        )}
      </ImageContainer>
    );
  }

  if (metadata?.asset_protocol) {
    return (
      <Video
        src={getFetchableUrl(metadata.asset_url ?? '', metadata.asset_protocol ?? '')}
        loop
        playsInline
        controls
        preload="auto"
        onClick={(event) => {
          // Prevent playback when clicking anywhere other than the controls
          event.preventDefault();
        }}
      />
    );
  }

  return (
    <ImageContainer isGalleryOpen={isGalleryOpen}>
      <ErrorStateImg />
    </ImageContainer>
  );
}

export default NftImage;
