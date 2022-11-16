import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { getNftDetail } from '@secretkeylabs/xverse-core/api';
import { NonFungibleToken, getBnsNftName } from '@secretkeylabs/xverse-core/types/index';
import { BNS_CONTRACT } from '@utils/constants';
import NftUser from '@assets/img/nftDashboard/nft_user.svg';
import { useNavigate } from 'react-router-dom';
import NftImage from './nftImage';

interface Props {
  asset: NonFungibleToken;
}

const NftNameText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  marginTop: 'auto',
}));

const GradientContainer = styled.div((props) => ({
  objectFit: 'cover',
  display: 'flex',
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  marginBottom: props.theme.spacing(4),
  background: 'linear-gradient(to bottom,#E5A78E, #EA603E, #4D52EF)',
}));

const GridItemContainer = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: props.theme.colors.white['0'],
  padding: props.theme.spacing(7),
  borderRadius: props.theme.radius(3),
  background: 'linear-gradient(27.88deg, #1D2032 0%, rgba(29, 32, 50, 0) 100%)',
  border: ` 1px solid ${props.theme.colors.background.elevation2}`,
}));

function Nft({ asset }: Props) {
  const navigate = useNavigate();
  const { data } = useQuery(
    ['nft-meta-data', asset.asset_identifier],
    async () => {
      const principal: string[] = asset.asset_identifier.split('::');
      const contractInfo: string[] = principal[0].split('.');
      return getNftDetail(
        asset.value.repr.replace('u', ''),
        contractInfo[0],
        contractInfo[1],
      );
    },
  );

  function getName() {
    if (data?.data.token_metadata) return `${data?.data.token_metadata.name} `;

    if (asset.asset_identifier === BNS_CONTRACT) {
      return getBnsNftName(asset);
    }
  }

  const handleOnClick = () => {

  };

  return (
    <GridItemContainer onClick={handleOnClick}>
      {asset.asset_identifier === BNS_CONTRACT ? (
        <GradientContainer>
          <img src={NftUser} alt="user" />
        </GradientContainer>
      ) : (
        <NftImage
          metadata={data?.data.token_metadata}
        />
      )}
      <NftNameText>{getName()}</NftNameText>
    </GridItemContainer>

  );
}
export default Nft;
