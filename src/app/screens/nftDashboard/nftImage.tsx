import { Suspense } from 'react';
import styled from 'styled-components';
import { MoonLoader } from 'react-spinners';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import Image from 'rc-image';
import { TokenMetaData } from '@secretkeylabs/xverse-core/types/api/stacks/assets';
import { getFetchableUrl } from '@utils/helper';
import NftPlaceholderImage from '@assets/img/nftDashboard/ic_nft_diamond.svg';
import { useTranslation } from 'react-i18next';

interface ContainerProps {
  isGalleryOpen: boolean;
}

const ImageContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  flex: 1,
  height: props.isGalleryOpen ? '100%' : 156,
  overflow: 'hidden',
  position: 'relative',
}));

const ButtonIcon = styled.img({
  width: 12,
  height: 12,
});

const OrdinalsTag = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'rgba(39, 42, 68, 0.6)',
  borderRadius: 40,
  width: 79,
  height: 22,
  left: 10,
  bottom: 10,
  zIndex: 1000,
  position: 'absolute',
  padding: '3px 6px',
});

const LoaderContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const Video = styled.video({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const Text = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  textTransform: 'uppercase',
  color: props.theme.colors.white[0],
  fontSize: 10,
  marginLeft: props.theme.spacing(4),
}));

const StyledImg = styled(Image)`
  border-radius: 8px;
  object-fit: contain;
`;
interface Props {
  metadata: TokenMetaData;
  isNftDashboard?: boolean;
}

function NftImage({ metadata, isNftDashboard = false }: Props) {
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  //check for ordinals
  const isOrdinal = false;
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  if (metadata?.image_protocol) {
    return (
      <ImageContainer isGalleryOpen={isGalleryOpen}>
        <Suspense>
          <StyledImg
            width="100%"
            placeholder={(
              <LoaderContainer>
                <MoonLoader color="white" size={25} />
              </LoaderContainer>
            )}
            src={getFetchableUrl(metadata.image_url ?? '', metadata.image_protocol ?? '')}
            fallback={NftPlaceholderImage}
          />
        </Suspense>
        {isOrdinal && isNftDashboard && (
        <OrdinalsTag>
          <ButtonIcon src={OrdinalsIcon} />
          <Text>{t('ORDINAL')}</Text>
        </OrdinalsTag>
        )}
      </ImageContainer>
    );
  }

  if (metadata?.asset_protocol) {
    return (
      <Video src={getFetchableUrl(metadata.asset_url ?? '', metadata.asset_protocol ?? '')} loop playsInline controls preload="auto" />
    );
  }

  return (
    <ImageContainer isGalleryOpen>
      <MoonLoader color="white" size={30} />
    </ImageContainer>
  );
}

export default NftImage;
