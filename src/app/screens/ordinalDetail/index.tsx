import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import TopRow from '@components/topRow';
import BottomTabBar from '@components/tabBar';
import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';
import SquaresFour from '@assets/img/nftDashboard/squares_four.svg';
import ArrowUp from '@assets/img/dashboard/arrow_up.svg';
import ActionButton from '@components/button';
import useWalletSelector from '@hooks/useWalletSelector';
import { useEffect, useMemo, useState } from 'react';
import AccountHeaderComponent from '@components/accountHeader';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import DescriptionTile from '@screens/nftDetail/descriptionTile';
import InfoContainer from '@components/infoContainer';
import usePendingOrdinalTxs from '@hooks/queries/usePendingOrdinalTx';
import AlertMessage from '@components/alertMessage';
import { getBtcTxStatusUrl } from '@utils/helper';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import useOrdinalDataReducer from '@hooks/stores/useOrdinalReducer';
import SmallActionButton from '@components/smallActionButton';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  margin-left: 5%;
  margin-right: 5%;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const SendButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(3),
  width: 182,
}));

const BackButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(40),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  position: 'relative',
  flexDirection: 'row',
  maxWidth: 400,
  marginBottom: props.theme.spacing(10.5),
}));

const ExtensionContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  marginTop: 8,
  alignItems: 'center',
  flex: 1,
});

const OrdinalsContainer = styled.div((props) => ({
  maxWidth: 450,
  width: '60%',
  display: 'flex',
  aspectRatio: 1,
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  borderRadius: 8,
  marginBottom: props.theme.spacing(12),
}));

const ExtensionOrdinalsContainer = styled.div((props) => ({
  maxHeight: 148,
  width: 148,
  display: 'flex',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  marginBottom: props.theme.spacing(12),
  marginTop: props.theme.spacing(12),
}));

const OrdinalTitleText = styled.h1((props) => ({
  ...props.theme.headline_m,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const OrdinalGalleryTitleText = styled.h1((props) => ({
  ...props.theme.headline_l,
  color: props.theme.colors.white['0'],
  marginBottom: props.theme.spacing(12),
}));

const DescriptionText = styled.h1((props) => ({
  ...props.theme.headline_l,
  color: props.theme.colors.white['0'],
  fontSize: 24,
  marginBottom: props.theme.spacing(16),
}));

const NftOwnedByText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['400'],
  textAlign: 'center',
}));

const OwnerAddressText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'center',
  marginLeft: props.theme.spacing(3),
}));

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

const RowContainer = styled.h1((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginTop: props.theme.spacing(6),
  flexDirection: 'row',
}));

const DescriptionContainer = styled.h1((props) => ({
  display: 'flex',
  marginLeft: props.theme.spacing(20),
  flexDirection: 'column',
  marginBottom: props.theme.spacing(30),
}));

const WebGalleryButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  width: '100%',
  marginTop: props.theme.spacing(18),
  marginBottom: props.theme.spacing(16),
}));

const WebGalleryButtonText = styled.div((props) => ({
  ...props.theme.body_m,
  fontWeight: 700,
  color: props.theme.colors.white['200'],
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  background: 'transparent',
  marginBottom: props.theme.spacing(12),
}));

const AssetDeatilButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 400,
  fontSize: 14,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
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
  marginLeft: 2,
  background: 'rgba(39, 42, 68, 0.6)',
  borderRadius: 40,
  height: 22,
  padding: '3px 6px',
});

const CollectibleText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['400'],
  textAlign: 'center',
}));

const Text = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  textTransform: 'uppercase',
  color: props.theme.colors.white[0],
  fontSize: 10,
  marginLeft: props.theme.spacing(2),
}));

function OrdinalDetailScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DETAIL_SCREEN' });
  const navigate = useNavigate();
  const { ordinalsAddress, network } = useWalletSelector();
  const { selectedOrdinal } = useNftDataSelector();
  const { setSelectedOrdinalDetails } = useOrdinalDataReducer();
  const { isPending, pendingTxHash } = usePendingOrdinalTxs(selectedOrdinal?.tx_id);
  const [notSupportedOrdinal, setNotSupportedOrdinal] = useState<boolean>(false);
  const [showSendOridnalsAlert, setshowSendOridnalsAlert] = useState<boolean>(false);

  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  useEffect(() => {
    if (selectedOrdinal) {
      if (
        selectedOrdinal?.content_type.includes('image')
        || selectedOrdinal?.content_type.includes('text')
      ) {
        setNotSupportedOrdinal(false);
      } else setNotSupportedOrdinal(true);
    }
  }, [selectedOrdinal?.content_type]);

  const handleBackButtonClick = () => {
    setSelectedOrdinalDetails(null);
    navigate('/nft-dashboard');
  };

  const openInGalleryView = async () => {
    setSelectedOrdinalDetails(selectedOrdinal);
    await chrome.tabs.create({
      url: chrome.runtime.getURL('options.html#/nft-dashboard/ordinal-detail'),
    });
  };
  const showAlert = () => {
    setshowSendOridnalsAlert(true);
  };

  const onCloseAlert = () => {
    setshowSendOridnalsAlert(false);
  };

  const handleSendOrdinal = () => {
    if (isPending) {
      showAlert();
    } else {
      navigate('send-ordinal');
    }
  };

  const handleRedirectToTx = () => {
    if (pendingTxHash) {
      window.open(getBtcTxStatusUrl(pendingTxHash, network), '_blank', 'noopener,noreferrer');
    }
  };

  const ownedByView = (
    <RowContainer>
      <NftOwnedByText>{t('OWNED_BY')}</NftOwnedByText>
      <OwnerAddressText>
        {`${ordinalsAddress.substring(0, 4)}...${ordinalsAddress.substring(
          ordinalsAddress.length - 4,
          ordinalsAddress.length,
        )}`}
      </OwnerAddressText>
      <OrdinalsTag>
        <ButtonIcon src={OrdinalsIcon} />
        <Text>{t('ORDINALS')}</Text>
      </OrdinalsTag>
    </RowContainer>
  );
  const extensionView = (
    <ExtensionContainer>
      <CollectibleText>{t('COLLECTIBLE')}</CollectibleText>
      <OrdinalTitleText>{selectedOrdinal?.number}</OrdinalTitleText>
      <ExtensionOrdinalsContainer>
        <OrdinalImage ordinal={selectedOrdinal!} />
      </ExtensionOrdinalsContainer>
      {notSupportedOrdinal && <InfoContainer bodyText={t('ORDINAL_NOT_DISPLAYED')} />}
      <ButtonContainer>
        <SmallActionButton src={ArrowUp} text={t('SEND')} onPress={handleSendOrdinal} />
      </ButtonContainer>
      {ownedByView}

      <WebGalleryButton onClick={openInGalleryView}>
        <>
          <ButtonImage src={SquaresFour} />
          <WebGalleryButtonText>{t('WEB_GALLERY')}</WebGalleryButtonText>
        </>
      </WebGalleryButton>
    </ExtensionContainer>
  );

  const galleryView = (
    <Container>
      <BackButtonContainer>
        <Button onClick={handleBackButtonClick}>
          <>
            <ButtonImage src={ArrowLeft} />
            <AssetDeatilButtonText>{t('MOVE_TO_ASSET_DETAIL')}</AssetDeatilButtonText>
          </>
        </Button>
      </BackButtonContainer>
      <OrdinalGalleryTitleText>
        {selectedOrdinal?.number ?? t('INSCRIPTION')}
      </OrdinalGalleryTitleText>
      <ButtonContainer>
        <SendButtonContainer>
          <ActionButton src={ArrowUp} text={t('SEND')} onPress={handleSendOrdinal} />
        </SendButtonContainer>
      </ButtonContainer>
      <RowContainer>
        <OrdinalsContainer>
          <OrdinalImage ordinal={selectedOrdinal!} inNftDetail />
          {ownedByView}
        </OrdinalsContainer>
        <DescriptionContainer>
          <DescriptionText>{t('DESCRIPTION')}</DescriptionText>
          {notSupportedOrdinal && <InfoContainer bodyText={t('ORDINAL_NOT_DISPLAYED')} />}
          <DescriptionTile title={t('ID')} value={selectedOrdinal?.id!} />
          {selectedOrdinal?.content_length && (
            <DescriptionTile
              title={t('CONTENT_LENGTH')}
              value={selectedOrdinal?.content_length.toString()!}
            />
          )}
          {selectedOrdinal?.content_type && (
            <DescriptionTile title={t('CONTENT_TYPE')} value={selectedOrdinal?.content_type!} />
          )}
          {selectedOrdinal?.value && (
            <DescriptionTile title={t('OUTPUT_VALUE')} value={selectedOrdinal?.value!} />
          )}
          {selectedOrdinal?.timestamp && (
            <DescriptionTile
              title={t('TIMESTAMP')}
              value={selectedOrdinal?.timestamp.toString()!}
            />
          )}
          {selectedOrdinal?.genesis_block_height && (
            <DescriptionTile
              title={t('GENESIS_HEIGHT')}
              value={selectedOrdinal?.genesis_block_height.toString()!}
            />
          )}
          {selectedOrdinal?.location && (
            <DescriptionTile title={t('LOCATION')} value={selectedOrdinal?.location!} />
          )}
        </DescriptionContainer>
      </RowContainer>
    </Container>
  );

  return (
    <>
      {isGalleryOpen ? (
        <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
      ) : (
        <TopRow title="" onClick={handleBackButtonClick} />
      )}
      <Container>
        {showSendOridnalsAlert && (
          <AlertMessage
            title={t('ORDINAL_PENDING_SEND_TITLE')}
            onClose={onCloseAlert}
            buttonText={t('ORDINAL_PENDING_SEND_BUTTON')}
            onButtonClick={handleRedirectToTx}
            description={t('ORDINAL_PENDING_SEND_DESCRIPTION')}
          />
        )}
        {isGalleryOpen ? galleryView : extensionView}
      </Container>
      {!isGalleryOpen && (
        <BottomBarContainer>
          <BottomTabBar tab="nft" />
        </BottomBarContainer>
      )}
    </>
  );
}

export default OrdinalDetailScreen;
