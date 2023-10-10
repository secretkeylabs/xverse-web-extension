import useOrdinalDataReducer from '@hooks/stores/useOrdinalReducer';
import { Inscription } from '@secretkeylabs/xverse-core/types/index';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import OrdinalImage from './ordinalImage';

interface Props {
  asset: Inscription;
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

const NftImageContainer = styled.div((props) => ({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  aspectRatio: '1',
  overflow: 'hidden',
  borderRadius: props.theme.radius(3),
  background: props.theme.colors.elevation1,
}));

const GridItemContainer = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.colors.white['0'],
  padding: 0,
  borderRadius: props.theme.radius(3),
  background: 'transparent',
}));

function Ordinal({ asset, isGalleryOpen }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const { setSelectedOrdinalDetails } = useOrdinalDataReducer();

  const handleOnClick = () => {
    setSelectedOrdinalDetails(asset);
    navigate(`/nft-dashboard/ordinal-detail/${asset.id}`);
  };

  return (
    <GridItemContainer onClick={handleOnClick}>
      {isGalleryOpen ? (
        <NftImageContainer>
          <OrdinalImage isNftDashboard ordinal={asset} />
        </NftImageContainer>
      ) : (
        <OrdinalImage isNftDashboard ordinal={asset} />
      )}
      <NftNameTextContainer>
        <NftNameText>{`${t('INSCRIPTION')} ${asset?.number} `}</NftNameText>
      </NftNameTextContainer>
    </GridItemContainer>
  );
}
export default Ordinal;
