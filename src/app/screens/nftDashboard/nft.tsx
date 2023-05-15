import styled from 'styled-components';
import { NonFungibleToken, getBnsNftName } from '@secretkeylabs/xverse-core/types/index';
import { BNS_CONTRACT } from '@utils/constants';
import NftUser from '@assets/img/nftDashboard/nft_user.svg';
import { useNavigate } from 'react-router-dom';
import useNftDataReducer from '@hooks/stores/useNftReducer';
import NftImage from './nftImage';

interface Props {
  asset: NonFungibleToken;
  isGalleryOpen: boolean;
}

const NftNameText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  textAlign: 'left',
}));

const NftNameTextContainer = styled.h1((props) => ({
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
  width: props.isGalleryView ? '100%' : 150,
  height: props.isGalleryView ? '100%' : 150,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  background: 'linear-gradient(to bottom,#E5A78E, #EA603E, #4D52EF)',
}));

const NftImageContainer = styled.div({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  overflow: 'hidden',
});

interface GridContainerProps {
  showBorder: boolean;
}

const GridItemContainer = styled.button<GridContainerProps>((props) => ({
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.colors.white['0'],
  padding: props.showBorder ? props.theme.spacing(7) : 0,
  marginBottom: props.theme.spacing(16),
  borderRadius: props.theme.radius(3),
  background: props.showBorder ? 'linear-gradient(27.88deg, #1D2032 0%, rgba(29, 32, 50, 0) 100%)' : 'transparent',
  border: props.showBorder ? ` 1px solid ${props.theme.colors.background.elevation2}` : 'transparent',
}));

function Nft({ asset, isGalleryOpen }: Props) {
  const navigate = useNavigate();
  const { storeNftData } = useNftDataReducer();

  function getName() {
    if (asset?.data?.token_metadata) {
      return asset?.data.token_metadata?.name.length <= 35 ? `${asset?.data.token_metadata?.name} `
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
  const showNftImg = isGalleryOpen ? (
    <NftImageContainer>
      <NftImage metadata={asset?.data?.token_metadata!} />
    </NftImageContainer>
  ) : (
    <NftImage metadata={asset?.data?.token_metadata!} />
  );

  return (
    <GridItemContainer onClick={handleOnClick} showBorder={isGalleryOpen}>
      {asset.asset_identifier === BNS_CONTRACT ? (
        <GradientContainer isGalleryView={isGalleryOpen}>
          <img src={NftUser} alt="user" />
        </GradientContainer>
      ) : (
        showNftImg
      )}
      <NftNameTextContainer>
        <NftNameText>{getName()}</NftNameText>
      </NftNameTextContainer>
    </GridItemContainer>
  );
}
export default Nft;
