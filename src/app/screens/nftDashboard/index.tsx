import FeatureIcon from '@assets/img/nftDashboard/rareSats/NewFeature.svg';
import AccountHeaderComponent from '@components/accountHeader';
import ActionButton from '@components/button';
import ShowOrdinalReceiveAlert from '@components/showOrdinalReceiveAlert';
import BottomTabBar from '@components/tabBar';
import WebGalleryButton from '@components/webGalleryButton';
import { ArrowDown } from '@phosphor-icons/react';
import { StyledHeading } from '@ui-library/common.styled';
import Dialog from '@ui-library/dialog';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import CollectiblesTabs from './collectiblesTabs';
import ReceiveNftModal from './receiveNft';
import { useNftDashboard } from './useNftDashboard';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  ${(props) => props.theme.scrollbar}
`;

const PageHeader = styled.div`
  padding: ${(props) => props.theme.space.s};
  padding-bottom: ${(props) => props.theme.space.xl};
  border-bottom: 0.5px solid ${(props) => props.theme.colors.elevation3};
  max-width: 1224px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

const StyledCollectiblesTabs = styled(CollectiblesTabs)`
  padding: 0 ${(props) => props.theme.space.s};
  padding-bottom: ${(props) => props.theme.space.xl};
  max-width: 1224px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

const StyledWebGalleryButton = styled(WebGalleryButton)`
  margin-top: ${(props) => props.theme.space.s};
`;

const ReceiveNftContainer = styled.div((props) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  zIndex: 2000,
  background: props.theme.colors.elevation2,
  borderRadius: 16,
}));

const CollectibleContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(12),
}));

const ButtonContainer = styled.div({
  display: 'flex',
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  maxWidth: 360,
});

const ReceiveButtonContainer = styled.div(() => ({
  width: '100%',
}));

function NftDashboard() {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const nftDashboard = useNftDashboard();
  const {
    openReceiveModal,
    showNewFeatureAlert,
    hasActivatedOrdinalsKey,
    isOrdinalReceiveAlertVisible,
    openInGalleryView,
    onReceiveModalOpen,
    onReceiveModalClose,
    onOrdinalReceiveAlertOpen,
    onOrdinalReceiveAlertClose,
    InscriptionListView,
    NftListView,
    onActivateRareSatsAlertCrossPress,
    onActivateRareSatsAlertDenyPress,
    onActivateRareSatsAlertEnablePress,
    isGalleryOpen,
  } = nftDashboard;

  return (
    <>
      {isOrdinalReceiveAlertVisible && (
        <ShowOrdinalReceiveAlert onOrdinalReceiveAlertClose={onOrdinalReceiveAlertClose} />
      )}
      {showNewFeatureAlert && (
        <Dialog
          title={t('NEW_FEATURE')}
          description={
            hasActivatedOrdinalsKey
              ? t('NEW_FEAT_RARE_SATS_ORDINALS_ENABLE')
              : t('NEW_FEAT_RARE_SATS_DESCRIPTION')
          }
          rightButtonText={t('ENABLE')}
          leftButtonText={t('MAYBE_LATER')}
          onRightButtonClick={onActivateRareSatsAlertEnablePress}
          onLeftButtonClick={onActivateRareSatsAlertDenyPress}
          onClose={onActivateRareSatsAlertCrossPress}
          type="feedback"
          icon={<img src={FeatureIcon} width="60" height="60" alt="new feature" />}
        />
      )}
      <AccountHeaderComponent disableMenuOption={isGalleryOpen} showBorderBottom={false} />
      <Container>
        <PageHeader>
          <CollectibleContainer>
            <StyledHeading typography={isGalleryOpen ? 'headline_xl' : 'headline_l'}>
              {t('COLLECTIBLES')}
            </StyledHeading>
            {!isGalleryOpen && <StyledWebGalleryButton onClick={openInGalleryView} />}
          </CollectibleContainer>
          <ButtonContainer>
            <ReceiveButtonContainer>
              <ActionButton
                icon={<ArrowDown weight="bold" size={16} />}
                text={t('RECEIVE')}
                onPress={onReceiveModalOpen}
              />
            </ReceiveButtonContainer>
            {openReceiveModal && (
              <ReceiveNftContainer>
                <ReceiveNftModal
                  visible={openReceiveModal}
                  isGalleryOpen={isGalleryOpen}
                  onClose={onReceiveModalClose}
                  setOrdinalReceiveAlert={onOrdinalReceiveAlertOpen}
                />
              </ReceiveNftContainer>
            )}
          </ButtonContainer>
        </PageHeader>
        <StyledCollectiblesTabs
          nftListView={<NftListView />}
          inscriptionListView={<InscriptionListView />}
          nftDashboard={nftDashboard}
        />
      </Container>
      {!isGalleryOpen && <BottomTabBar tab="nft" />}
    </>
  );
}
export default NftDashboard;
