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

const NftNameTextContainer = styled.h1((props) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  marginTop: props.theme.spacing(6),
}));

const NftImageContainer = styled.div({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  aspectRatio: '1',
  overflow: 'hidden',
});

interface GridContainerProps {
  showBorder: boolean;
}

const GridItemContainer = styled.button<GridContainerProps>((props) => ({
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.colors.white_0,
  padding: props.showBorder ? props.theme.spacing(7) : 0,
  marginBottom: props.theme.spacing(16),
  borderRadius: props.theme.radius(3),
  background: props.showBorder
    ? 'linear-gradient(27.88deg, #1D2032 0%, rgba(29, 32, 50, 0) 100%)'
    : 'transparent',
  border: props.showBorder ? ` 1px solid ${props.theme.colors.elevation2}` : 'transparent',
}));

function Ordinal({ asset, isGalleryOpen }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const { setSelectedOrdinalDetails } = useOrdinalDataReducer();

  const handleOnClick = () => {
    setSelectedOrdinalDetails(asset);
    navigate('ordinal-detail');
  };

  return (
    <GridItemContainer onClick={handleOnClick} showBorder={isGalleryOpen}>
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
