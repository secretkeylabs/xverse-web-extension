import NftUser from '@assets/img/nftDashboard/nft_user.svg';
import useNftDataReducer from '@hooks/stores/useNftReducer';
import { getBnsNftName, NonFungibleToken } from '@secretkeylabs/xverse-core/types/index';
import { BNS_CONTRACT } from '@utils/constants';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import NftImage from './nftImage';

interface Props {
  asset: NonFungibleToken;
  isGalleryOpen: boolean;
}

const NftNameText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  textAlign: 'left',
}));

const NftNameTextContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  marginTop: props.theme.spacing(6),
}));

interface ContainerProps {
  isGalleryView: boolean;
}

const GradientContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  width: props.isGalleryView ? '100%' : 57,
  minHeight: props.isGalleryView ? 200 : 57,
  height: props.isGalleryView ? '100%' : 57,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  background: props.theme.colors.elevation1,
}));

const NftImageContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  width: '100%',
  overflow: 'hidden',
  borderRadius: 8,
  background: props.theme.colors.elevation1,
  flexGrow: props.isGalleryView ? 1 : 'initial',
}));

const GridItemContainer = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.colors.white['0'],
  padding: 0,
  borderRadius: props.theme.radius(3),
  background: 'transparent',
}));

function Nft({ asset, isGalleryOpen }: Props) {
  const navigate = useNavigate();
  const { storeNftData } = useNftDataReducer();

  function getName() {
    if (asset?.data?.token_metadata) {
      return asset?.data.token_metadata?.name.length <= 35
        ? `${asset?.data.token_metadata?.name} `
        : `${asset?.data.token_metadata?.name.substring(0, 35)}...`;
    }

    if (asset.asset_identifier === BNS_CONTRACT) {
      return getBnsNftName(asset);
    }
  }

  const handleOnClick = () => {
    const url = `${asset.asset_identifier}::${asset.value.repr}`;
    storeNftData(asset?.data!);
    if (asset.asset_identifier !== BNS_CONTRACT) {
      navigate(`nft-detail/${url}`);
    }
  };

  return (
    <GridItemContainer onClick={handleOnClick}>
      {asset.asset_identifier === BNS_CONTRACT ? (
        <GradientContainer isGalleryView={isGalleryOpen}>
          <NftImageContainer isGalleryView={isGalleryOpen}>
            <img src={NftUser} alt="user" />
          </NftImageContainer>
        </GradientContainer>
      ) : (
        <NftImageContainer isGalleryView={isGalleryOpen}>
          <NftImage metadata={asset?.data?.token_metadata!} />
        </NftImageContainer>
      )}
      <NftNameTextContainer>
        <NftNameText>{getName()}</NftNameText>
      </NftNameTextContainer>
    </GridItemContainer>
  );
}
export default Nft;
