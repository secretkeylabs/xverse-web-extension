import styled, { useTheme } from 'styled-components';
import { Ring } from 'react-spinners-css';
import useWalletSelector from '@hooks/useWalletSelector';
import BottomTabBar from '@components/tabBar';
import AccountRow from '@components/accountRow';
import Seperator from '@components/seperator';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SquaresFour from '@assets/img/nftDashboard/squares_four.svg';
import ArrowDownLeft from '@assets/img/dashboard/arrow_down_left.svg';
import ShareNetwork from '@assets/img/nftDashboard/share_network.svg';
import ActionButton from '@components/button';
import { getNftsData } from '@secretkeylabs/xverse-core/api';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NonFungibleToken } from '@secretkeylabs/xverse-core/types';
import BarLoader from '@components/barLoader';
import { GAMMA_URL, LoaderSize } from '@utils/constants';
import ShareDialog from '@components/shareNft';
import Nft from './nft';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 5%;
  margin-right: 5%;
  margin-bottom: 5%;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const GridContainer = styled.div((props) => ({
  display: 'grid',
  columnGap: props.theme.spacing(8),
  rowGap: props.theme.spacing(6),
  gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
}));

const SelectedAccountContainer = styled.div({
  marginLeft: '5%',
  marginRight: '5%',
});

const CollectibleContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(12),
  marginBottom: props.theme.spacing(12),
}));

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(12),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  position: 'relative',
  flexDirection: 'row',
  maxWidth: 400,
  marginBottom: props.theme.spacing(20),
}));

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

const CollectiblesHeadingText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['200'],
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  opacity: 0.7,
}));

const CollectiblesValueText = styled.h1((props) => ({
  ...props.theme.headline_l,
  marginTop: props.theme.spacing(4),
}));

const NoCollectiblesText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['200'],
  marginTop: props.theme.spacing(4),
  textAlign: 'center',
}));

const BarLoaderContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(5),
  maxWidth: 300,
}));

function NftDashboard() {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const navigate = useNavigate();
  const theme = useTheme();
  const offset = useRef(0);
  const { selectedAccount, stxAddress, network } = useWalletSelector();
  const [nftList, setNftList] = useState<NonFungibleToken[]>([]);
  const [nftTotal, setNftTotal] = useState<number>(0);
  const [showShareNftOptions, setShowNftOptions] = useState<boolean>(false);

  const { isLoading, data } = useQuery(
    ['nft-meta-data', { stxAddress, network, offset: offset.current }],
    async () => getNftsData(stxAddress, network, offset.current),
  );

  useEffect(() => {
    if (data) {
      setNftList(data.nftsList);
      setNftTotal(data.total);
    }
  }, [data]);
  const handleAccountSelect = () => {
    navigate('/account-list');
  };

  const openInGalleryView = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL('options.html#/nft-dashboard'),
    });
  };

  const nftListView = nftTotal === 0 ? (
    <NoCollectiblesText>{t('NO_COLLECTIBLES')}</NoCollectiblesText>
  ) : (
    <GridContainer>
      {nftList.map((nft) => (
        <Nft asset={nft} />
      ))}
    </GridContainer>
  );

  const onSharePress = () => {
    setShowNftOptions(true);
  };

  const onCrossPress = () => {
    setShowNftOptions(false);
  };

  const onReceivePress = () => {
    navigate('/receive/STX');
  };

  return (
    <>
      <SelectedAccountContainer>
        <AccountRow account={selectedAccount!} isSelected onAccountSelected={handleAccountSelect} />
      </SelectedAccountContainer>
      <Seperator />
      <Container>
        <CollectibleContainer>
          <CollectiblesHeadingText>{t('COLLECTIBLES')}</CollectiblesHeadingText>
          {isLoading ? (
            <BarLoaderContainer>
              <BarLoader loaderSize={LoaderSize.LARGE} />
            </BarLoaderContainer>
          ) : (
            <CollectiblesValueText>{`${nftTotal} ${t('ITEMS')}`}</CollectiblesValueText>
          )}
          <ActionButton
            src={SquaresFour}
            text={t('WEB_GALLERY')}
            onPress={openInGalleryView}
            buttonColor="transparent"
            buttonAlignment="flex-start"
          />
        </CollectibleContainer>
        <ButtonContainer>
          <ActionButton src={ArrowDownLeft} text={t('RECEIVE')} onPress={onReceivePress} />
          <ActionButton
            src={ShareNetwork}
            text={t('SHARE')}
            onPress={onSharePress}
            buttonColor="transparent"
            margin={3}
            buttonBorderColor={theme.colors.background.elevation2}
          />
          {showShareNftOptions && (
            <ShareDialog url={`${GAMMA_URL}${stxAddress}`} onCrossClick={onCrossPress} />
          )}
        </ButtonContainer>
        {isLoading ? (
          <LoaderContainer>
            <Ring color="white" size={30} />
          </LoaderContainer>
        ) : (
          nftListView
        )}
      </Container>

      <BottomBarContainer>
        <BottomTabBar tab="nft" />
      </BottomBarContainer>
    </>
  );
}

export default NftDashboard;
