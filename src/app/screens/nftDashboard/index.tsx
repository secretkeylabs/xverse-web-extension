import AccountHeaderComponent from '@components/accountHeader';
import ShowOrdinalReceiveAlert from '@components/showOrdinalReceiveAlert';
import BottomTabBar from '@components/tabBar';
import WebGalleryButton from '@components/webGalleryButton';
import { ArrowDown } from '@phosphor-icons/react';
import Button from '@ui-library/button';
import { StyledHeading } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import CollectiblesTabs from './collectiblesTabs';
import { CollectiblesContainer } from './collectiblesTabs/index.styled';
import ReceiveNftModal from './receiveNft';
import useNftDashboard from './useNftDashboard';

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
  maxWidth: 360,
}));

const CollectibleContainer = styled.div((props) => ({
  marginBottom: props.theme.space.l,
}));

const ButtonContainer = styled.div({
  display: 'flex',
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const ReceiveButtonContainer = styled.div(() => ({
  width: '100%',
}));

function NftDashboard() {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const nftDashboard = useNftDashboard();
  const {
    openReceiveModal,
    isOrdinalReceiveAlertVisible,
    openInGalleryView,
    onReceiveModalOpen,
    onReceiveModalClose,
    onOrdinalReceiveAlertClose,
    InscriptionListView,
    NftListView,
    isGalleryOpen,
  } = nftDashboard;

  return (
    <>
      {isOrdinalReceiveAlertVisible && (
        <ShowOrdinalReceiveAlert onOrdinalReceiveAlertClose={onOrdinalReceiveAlertClose} />
      )}
      <AccountHeaderComponent disableMenuOption={isGalleryOpen} />
      <Container>
        <PageHeader>
          <CollectibleContainer>
            <StyledHeading typography={isGalleryOpen ? 'headline_xl' : 'headline_l'}>
              {t('COLLECTIBLES')}
            </StyledHeading>
            {!isGalleryOpen && <StyledWebGalleryButton onClick={openInGalleryView} />}
          </CollectibleContainer>
          <ButtonContainer data-testid="receive-button">
            <ReceiveButtonContainer>
              <Button
                icon={<ArrowDown weight="bold" size={16} />}
                title={t('RECEIVE')}
                onClick={onReceiveModalOpen}
              />
            </ReceiveButtonContainer>
            {openReceiveModal && (
              <ReceiveNftContainer>
                <ReceiveNftModal visible={openReceiveModal} onClose={onReceiveModalClose} />
              </ReceiveNftContainer>
            )}
          </ButtonContainer>
        </PageHeader>
        <CollectiblesContainer>
          <CollectiblesTabs
            nftListView={<NftListView />}
            inscriptionListView={<InscriptionListView />}
            nftDashboard={nftDashboard}
          />
        </CollectiblesContainer>
      </Container>
      <BottomTabBar tab="nft" />
    </>
  );
}

export default NftDashboard;
