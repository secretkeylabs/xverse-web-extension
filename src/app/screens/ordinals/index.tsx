import styled from 'styled-components';
import { BtcOrdinal, OrdinalInfo } from '@secretkeylabs/xverse-core/types/index';
import { useNavigate } from 'react-router-dom';
import useOrdinalDataReducer from '@hooks/useOrdinalReducer';
import { getOrdinalInfo } from '@secretkeylabs/xverse-core';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import useNftDataSelector from '@hooks/useNftDataSelector';
import { useTranslation } from 'react-i18next';
import OrdinalImage from './ordinalImage';

interface Props {
  asset: BtcOrdinal;
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

function Ordinal({ asset }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const { storeOrdinalsMetaData } = useOrdinalDataReducer();
  const { ordinalsData } = useNftDataSelector();
  const [ordinalData, setOrdinalData] = useState<OrdinalInfo>();
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const {
    data: ordinalDetailsData,
    mutate,
  } = useMutation<
  OrdinalInfo | undefined,
  Error,
  { ordinalId: string }>(async ({ ordinalId }) => getOrdinalInfo(ordinalId));
  useEffect(() => {
    const ordinalMetaData = ordinalsData.find((ordinal) => ordinal?.metadata?.id === asset?.id);
    if (!ordinalMetaData && asset?.id) {
      mutate({ ordinalId: asset?.id });
    } else {
      setOrdinalData(ordinalMetaData);
    }
  }, []);

  useEffect(() => {
    if (ordinalDetailsData) {
      storeOrdinalsMetaData(ordinalDetailsData);
      setOrdinalData(ordinalDetailsData);
    }
  }, [ordinalDetailsData]);

  const handleOnClick = () => {
    storeOrdinalsMetaData(ordinalData!);
    navigate(`ordinal-detail/${asset.id}`);
  };

  return (
    <GridItemContainer onClick={handleOnClick} showBorder={isGalleryOpen}>
      { isGalleryOpen ? (
        <NftImageContainer>
          <OrdinalImage isNftDashboard ordinal={ordinalData!} />
        </NftImageContainer>
      ) : (
        <OrdinalImage isNftDashboard ordinal={ordinalData!} />
      )}
      <NftNameTextContainer>
        <NftNameText>{ordinalData?.inscriptionNumber ?? t('INSCRIPTION')}</NftNameText>
      </NftNameTextContainer>
    </GridItemContainer>
  );
}
export default Ordinal;
