import styled from 'styled-components';
import { NonFungibleToken, getBnsNftName } from '@secretkeylabs/xverse-core/types/index';
import { BNS_CONTRACT } from '@utils/constants';
import NftUser from '@assets/img/nftDashboard/nft_user.svg';
import { useNavigate } from 'react-router-dom';
import useNftDataReducer from '@hooks/useNftReducer';
import NftImage from './nftImage';

interface Props {
  asset: NonFungibleToken;
}

const NftNameText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  textAlign: 'flex-start',
}));

const NftNameTextContainer = styled.h1((props) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  marginTop: props.theme.spacing(4),
}));

const GradientContainer = styled.div({
  display: 'flex',
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  background: 'linear-gradient(to bottom,#E5A78E, #EA603E, #4D52EF)',
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

function Nft({ asset }: Props) {
  const navigate = useNavigate();
  const { storeNftData } = useNftDataReducer();
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const url = `${asset.asset_identifier}::${asset.value.repr}`;

  function getName() {
    if (asset?.data?.token_metadata) return `${asset?.data.token_metadata.name} `;

    if (asset.asset_identifier === BNS_CONTRACT) {
      return getBnsNftName(asset);
    }
  }

  const handleOnClick = () => {
    storeNftData(asset?.data!);
    if (asset.asset_identifier !== BNS_CONTRACT) {
      navigate(`nft-detail/${url}`);
    }
  };

  return (
    <GridItemContainer onClick={handleOnClick} showBorder={isGalleryOpen}>
      {asset.asset_identifier === BNS_CONTRACT ? (
        <GradientContainer>
          <img src={NftUser} alt="user" />
        </GradientContainer>

      ) : (
        <NftImage
          metadata={asset?.data?.token_metadata!}
        />
      )}
      <NftNameTextContainer>
        <NftNameText>{getName()}</NftNameText>
      </NftNameTextContainer>

    </GridItemContainer>
  );
}
export default Nft;
