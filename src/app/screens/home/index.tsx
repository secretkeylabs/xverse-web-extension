import dashboardIcon from '@assets/img/dashboard-icon.svg';
import BitcoinToken from '@assets/img/dashboard/bitcoin_token.svg';
import ListDashes from '@assets/img/dashboard/list_dashes.svg';
import ordinalsIcon from '@assets/img/dashboard/ordinalBRC20.svg';
import stacksIcon from '@assets/img/dashboard/stx_icon.svg';
import ArrowSwap from '@assets/img/icons/ArrowSwap.svg';
import AccountHeaderComponent from '@components/accountHeader';
import BottomModal from '@components/bottomModal';
import ReceiveCardComponent from '@components/receiveCardComponent';
import ShowBtcReceiveAlert from '@components/showBtcReceiveAlert';
import ShowOrdinalReceiveAlert from '@components/showOrdinalReceiveAlert';
import BottomBar from '@components/tabBar';
import TokenTile from '@components/tokenTile';
import { useVisibleBrc20FungibleTokens } from '@hooks/queries/ordinals/useGetBrc20FungibleTokens';
import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useGetRuneFungibleTokens';
import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useAppConfig from '@hooks/queries/useAppConfig';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useFeeMultipliers from '@hooks/queries/useFeeMultipliers';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useHasFeature from '@hooks/useHasFeature';
import useNotificationBanners from '@hooks/useNotificationBanners';
import useSanityCheck from '@hooks/useSanityCheck';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowDown, ArrowUp, Plus } from '@phosphor-icons/react';
import CoinSelectModal from '@screens/home/coinSelectModal';
import { type FungibleToken } from '@secretkeylabs/xverse-core';
import { changeShowDataCollectionAlertAction } from '@stores/wallet/actions/actionCreators';
import Button from '@ui-library/button';
import Divider from '@ui-library/divider';
import Sheet from '@ui-library/sheet';
import { CurrencyTypes } from '@utils/constants';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { optInMixPanel, optOutMixPanel } from '@utils/mixpanel';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import SquareButton from '../../components/squareButton';
import BalanceCard from './balanceCard';
import Banner from './banner';

// TODO: Move this styles to ./index.styled.ts
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 ${(props) => props.theme.space.xs};
  ${(props) => props.theme.scrollbar}
`;

const ColumnContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'space-between',
  justifyContent: 'space-between',
  gap: props.theme.space.s,
  marginTop: props.theme.space.l,
  marginBottom: props.theme.space.s,
}));

const ReceiveContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(12),
  marginBottom: props.theme.spacing(16),
  gap: props.theme.space.m,
}));

const TokenListButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  opacity: 0.8,
  marginTop: props.theme.spacing(5),
  cursor: props.disabled ? 'not-allowed' : 'pointer',
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.typography.body_s,
  fontWeight: 700,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(11),
  columnGap: props.theme.spacing(11),
}));

const TokenListButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: props.theme.spacing(6),
  marginBottom: props.theme.spacing(22),
}));

const StyledTokenTile = styled(TokenTile)`
  background-color: ${(props) => props.theme.colors.elevation1};
`;

const Icon = styled.img({
  width: 24,
  height: 24,
});

const MergedOrdinalsIcon = styled.img({
  width: 64,
  height: 24,
});

const VerifyOrViewContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(16),
  marginBottom: props.theme.spacing(20),
}));

const VerifyButtonContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(6),
}));

const ModalContent = styled.div((props) => ({
  padding: props.theme.spacing(8),
  paddingTop: 0,
  paddingBottom: props.theme.spacing(16),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const ModalIcon = styled.img((props) => ({
  marginBottom: props.theme.spacing(10),
}));

const ModalTitle = styled.div((props) => ({
  ...props.theme.typography.body_bold_l,
  marginBottom: props.theme.spacing(4),
  textAlign: 'center',
}));

const ModalDescription = styled.div((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.spacing(16),
  textAlign: 'center',
}));

const ModalControlsContainer = styled.div({
  display: 'flex',
  width: '100%',
});

const ModalButtonContainer = styled.div((props) => ({
  width: '100%',
  '&:first-child': {
    marginRight: props.theme.spacing(6),
  },
}));

const StacksIcon = styled.img({
  width: 24,
  height: 24,
  position: 'absolute',
  zIndex: 2,
  left: 0,
  top: 0,
});

const MergedIcon = styled.div((props) => ({
  position: 'relative',
  marginBottom: props.theme.spacing(12),
}));

const IconBackground = styled.div((props) => ({
  width: 24,
  height: 24,
  position: 'absolute',
  zIndex: 1,
  left: 20,
  top: 0,
  backgroundColor: props.theme.colors.white_900,
  borderRadius: 30,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const StyledDivider = styled(Divider)`
  flex: 1 0 auto;
  width: calc(100% + ${(props) => props.theme.space.xl});
  margin-left: -${(props) => props.theme.space.m};
  margin-right: -${(props) => props.theme.space.m};
`;

function Home() {
  const { t } = useTranslation('translation', {
    keyPrefix: 'DASHBOARD_SCREEN',
  });
  const {
    stxAddress,
    btcAddress,
    ordinalsAddress,
    selectedAccount,
    showBtcReceiveAlert,
    showOrdinalReceiveAlert,
    showDataCollectionAlert,
    network,
    hideStx,
    notificationBanners,
  } = useWalletSelector();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openReceiveModal, setOpenReceiveModal] = useState(false);
  const [openSendModal, setOpenSendModal] = useState(false);
  const [openBuyModal, setOpenBuyModal] = useState(false);
  const [isBtcReceiveAlertVisible, setIsBtcReceiveAlertVisible] = useState(false);
  const [isOrdinalReceiveAlertVisible, setIsOrdinalReceiveAlertVisible] = useState(false);
  const [areReceivingAddressesVisible, setAreReceivingAddressesVisible] = useState(
    !isLedgerAccount(selectedAccount),
  );
  const [choseToVerifyAddresses, setChoseToVerifyAddresses] = useState(false);
  const { isInitialLoading: loadingStxWalletData, isRefetching: refetchingStxWalletData } =
    useStxWalletData();
  const { isLoading: loadingBtcWalletData, isRefetching: refetchingBtcWalletData } =
    useBtcWalletData();
  const { data: notificationBannersArr } = useNotificationBanners();
  const {
    visible: sip10CoinsList,
    isLoading: loadingStxCoinData,
    isRefetching: refetchingStxCoinData,
  } = useVisibleSip10FungibleTokens();
  const {
    visible: brc20CoinsList,
    isLoading: loadingBtcCoinData,
    isRefetching: refetchingBtcCoinData,
  } = useVisibleBrc20FungibleTokens();
  const {
    visible: runesCoinsList,
    isLoading: loadingRunesData,
    isRefetching: refetchingRunesData,
  } = useVisibleRuneFungibleTokens();
  const { getSanityCheck } = useSanityCheck();

  useFeeMultipliers();
  useAppConfig();
  useTrackMixPanelPageViewed();

  useEffect(() => {
    (async () => {
      if (localStorage.getItem('sanityCheck')) {
        return;
      }
      localStorage.setItem('sanityCheck', 'true');
      getSanityCheck('X-Current-Version');
    })();
  }, [getSanityCheck]);

  const showNotificationBanner =
    notificationBannersArr?.length &&
    notificationBannersArr.length > 0 &&
    !notificationBanners[notificationBannersArr[0].id];

  const onReceiveModalOpen = () => {
    setOpenReceiveModal(true);
  };

  const onReceiveModalClose = () => {
    setOpenReceiveModal(false);

    if (isLedgerAccount(selectedAccount)) {
      setAreReceivingAddressesVisible(false);
      setChoseToVerifyAddresses(false);
    }
  };

  const onSendModalOpen = () => {
    setOpenSendModal(true);
  };

  const onSendModalClose = () => {
    setOpenSendModal(false);
  };

  const onBuyModalOpen = () => {
    setOpenBuyModal(true);
  };

  const onBuyModalClose = () => {
    setOpenBuyModal(false);
  };

  const sendSheetCoinsList = (stxAddress ? sip10CoinsList : [])
    // ENG-4020 - Disable BRC20 Sending on Ledger
    .concat(isLedgerAccount(selectedAccount) ? [] : brc20CoinsList)
    .concat(runesCoinsList)
    .filter((ft) => new BigNumber(ft.balance).gt(0));

  const handleManageTokenListOnClick = () => {
    navigate('/manage-tokens');
  };

  const onStxSendClick = async () => {
    if (isLedgerAccount(selectedAccount) && !isInOptions()) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL('options.html#/send-stx'),
      });
      return;
    }
    navigate('/send-stx');
  };

  const onBtcSendClick = async () => {
    if (isLedgerAccount(selectedAccount) && !isInOptions()) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL('options.html#/send-btc'),
      });
      return;
    }
    navigate('/send-btc');
  };

  const onBTCReceiveSelect = () => {
    navigate('/receive/BTC');
  };

  const onSTXReceiveSelect = () => {
    navigate('/receive/STX');
  };

  const onSendFtSelect = async (fungibleToken: FungibleToken) => {
    if (fungibleToken.protocol === 'brc-20') {
      if (isLedgerAccount(selectedAccount) && !isInOptions()) {
        await chrome.tabs.create({
          // TODO replace with send-brc20-one-step route, when ledger support is ready
          url: chrome.runtime.getURL(`options.html#/send-brc20?coinTicker=${fungibleToken.ticker}`),
        });
        return;
      }
      navigate('/send-brc20-one-step', {
        state: {
          fungibleToken,
        },
      });
      return;
    }
    if (fungibleToken.protocol === 'stacks') {
      if (isLedgerAccount(selectedAccount) && !isInOptions()) {
        await chrome.tabs.create({
          // TODO - check why use coin ticker when its kinda risky? shouldnt fungibalToken.principal be the main identifier?
          url: chrome.runtime.getURL(`options.html#/send-sip10?coinTicker=${fungibleToken.ticker}`),
        });
        return;
      }
      navigate('/send-sip10', {
        state: {
          fungibleToken,
        },
      });
    }
    if (fungibleToken.protocol === 'runes') {
      if (isLedgerAccount(selectedAccount) && !isInOptions()) {
        await chrome.tabs.create({
          url: chrome.runtime.getURL(`options.html#/send-rune?coinTicker=${fungibleToken.name}`),
        });
        return;
      }
      navigate('/send-rune', {
        state: {
          fungibleToken,
        },
      });
    }
  };

  const onBuyStxClick = () => {
    navigate('/buy/STX');
  };

  const onBuyBtcClick = () => {
    navigate('/buy/BTC');
  };

  const onOrdinalReceiveAlertOpen = () => {
    if (showOrdinalReceiveAlert) setIsOrdinalReceiveAlertVisible(true);
  };

  const onOrdinalReceiveAlertClose = () => {
    setIsOrdinalReceiveAlertVisible(false);
  };

  const onReceiveAlertClose = () => {
    setIsBtcReceiveAlertVisible(false);
  };

  const onReceiveAlertOpen = () => {
    if (showBtcReceiveAlert) setIsBtcReceiveAlertVisible(true);
  };

  const handleTokenPressed = (currency: CurrencyTypes, ftKey?: string) => {
    if (ftKey) {
      navigate(`/coinDashboard/${currency}?ftKey=${ftKey}`);
    } else {
      navigate(`/coinDashboard/${currency}`);
    }
  };

  const onOrdinalsReceivePress = () => {
    navigate('/receive/ORD');
  };

  const onSwapPressed = () => {
    navigate('/swap');
  };

  const receiveContent = (
    <ReceiveContainer>
      <ReceiveCardComponent
        title={t('BITCOIN')}
        address={btcAddress}
        onQrAddressClick={onBTCReceiveSelect}
        onCopyAddressClick={onReceiveAlertOpen}
        showVerifyButton={choseToVerifyAddresses}
        currency="BTC"
      >
        <Icon src={BitcoinToken} />
      </ReceiveCardComponent>

      <ReceiveCardComponent
        title={t('ORDINALS_AND_BRC20')}
        address={ordinalsAddress}
        onQrAddressClick={onOrdinalsReceivePress}
        onCopyAddressClick={onOrdinalReceiveAlertOpen}
        showVerifyButton={choseToVerifyAddresses}
        currency="ORD"
      >
        <MergedOrdinalsIcon src={ordinalsIcon} />
      </ReceiveCardComponent>

      {stxAddress && (
        <ReceiveCardComponent
          title={t('STACKS_AND_TOKEN')}
          address={stxAddress}
          onQrAddressClick={onSTXReceiveSelect}
          showVerifyButton={choseToVerifyAddresses}
          currency="STX"
        >
          <MergedIcon>
            <StacksIcon src={stacksIcon} />
            <IconBackground>
              <Plus weight="bold" size={12} />
            </IconBackground>
          </MergedIcon>
        </ReceiveCardComponent>
      )}

      {isLedgerAccount(selectedAccount) && !stxAddress && (
        <Button
          variant="secondary"
          icon={<Plus color="white" size={16} />}
          title={t('ADD_STACKS_ADDRESS')}
          onClick={async () => {
            if (!isInOptions()) {
              await chrome.tabs.create({
                url: chrome.runtime.getURL(`options.html#/add-stx-address-ledger`),
              });
            } else {
              navigate('/add-stx-address-ledger');
            }
          }}
        />
      )}
    </ReceiveContainer>
  );

  const verifyOrViewAddresses = (
    <VerifyOrViewContainer>
      <VerifyButtonContainer>
        <Button
          title={t('VERIFY_ADDRESSES_ON_LEDGER')}
          onClick={() => {
            setChoseToVerifyAddresses(true);
            setAreReceivingAddressesVisible(true);
          }}
        />
      </VerifyButtonContainer>
      <Button
        variant="secondary"
        title={t('VIEW_ADDRESSES')}
        onClick={() => {
          if (choseToVerifyAddresses) {
            setChoseToVerifyAddresses(false);
          }
          setAreReceivingAddressesVisible(true);
        }}
      />
    </VerifyOrViewContainer>
  );

  const handleDataCollectionDeny = () => {
    optOutMixPanel();
    dispatch(changeShowDataCollectionAlertAction(false));
  };

  const handleDataCollectionAllow = () => {
    optInMixPanel(selectedAccount?.masterPubKey);
    dispatch(changeShowDataCollectionAlertAction(false));
  };

  const showSwaps = !isLedgerAccount(selectedAccount) && network.type !== 'Testnet';
  const showRunes = useHasFeature('RUNES_SUPPORT');

  return (
    <>
      <AccountHeaderComponent />
      {isBtcReceiveAlertVisible && (
        <ShowBtcReceiveAlert onReceiveAlertClose={onReceiveAlertClose} />
      )}
      {isOrdinalReceiveAlertVisible && (
        <ShowOrdinalReceiveAlert onOrdinalReceiveAlertClose={onOrdinalReceiveAlertClose} />
      )}
      <Container>
        <BalanceCard
          isLoading={loadingStxWalletData || loadingBtcWalletData}
          isRefetching={
            refetchingBtcCoinData ||
            refetchingBtcWalletData ||
            refetchingStxCoinData ||
            refetchingStxWalletData ||
            refetchingRunesData
          }
        />
        <RowButtonContainer data-testid="transaction-buttons-row">
          <SquareButton
            icon={<ArrowUp weight="regular" size="20" />}
            text={t('SEND')}
            onPress={onSendModalOpen}
          />
          <SquareButton
            icon={<ArrowDown weight="regular" size="20" />}
            text={t('RECEIVE')}
            onPress={onReceiveModalOpen}
          />
          {showSwaps && <SquareButton src={ArrowSwap} text={t('SWAP')} onPress={onSwapPressed} />}
          <SquareButton
            icon={<Plus weight="regular" size="20" />}
            text={t('BUY')}
            onPress={onBuyModalOpen}
          />
        </RowButtonContainer>

        {showNotificationBanner && (
          <>
            <br />
            <StyledDivider color="white_850" verticalMargin="m" />
            <Banner {...notificationBannersArr[0]} />
            <StyledDivider color="white_850" verticalMargin="xxs" />
          </>
        )}

        <ColumnContainer>
          {btcAddress && (
            <StyledTokenTile
              title={t('BITCOIN')}
              currency="BTC"
              loading={loadingBtcWalletData}
              onPress={handleTokenPressed}
            />
          )}
          {stxAddress && !hideStx && (
            <StyledTokenTile
              title={t('STACKS')}
              currency="STX"
              loading={loadingStxWalletData}
              onPress={handleTokenPressed}
            />
          )}
          {!!stxAddress &&
            sip10CoinsList.map((coin) => (
              <StyledTokenTile
                key={coin.name}
                title={coin.name}
                currency="FT"
                loading={loadingStxCoinData}
                fungibleToken={coin}
                onPress={handleTokenPressed}
              />
            ))}
          {brc20CoinsList.map((coin) => (
            <StyledTokenTile
              key={coin.name}
              title={coin.name}
              currency="FT"
              loading={loadingBtcCoinData}
              fungibleToken={coin}
              onPress={handleTokenPressed}
            />
          ))}
          {showRunes &&
            runesCoinsList.map((coin) => (
              <StyledTokenTile
                key={coin.name}
                title={coin.name}
                currency="FT"
                loading={loadingRunesData}
                fungibleToken={coin}
                onPress={handleTokenPressed}
              />
            ))}
        </ColumnContainer>
        <Sheet visible={openReceiveModal} title={t('RECEIVE')} onClose={onReceiveModalClose}>
          {areReceivingAddressesVisible ? receiveContent : verifyOrViewAddresses}
        </Sheet>

        <TokenListButtonContainer>
          <TokenListButton onClick={handleManageTokenListOnClick}>
            <>
              <ButtonImage src={ListDashes} />
              <ButtonText>{t('MANAGE_TOKEN')}</ButtonText>
            </>
          </TokenListButton>
        </TokenListButtonContainer>

        <CoinSelectModal
          onSelectBitcoin={onBtcSendClick}
          onSelectStacks={onStxSendClick}
          onClose={onSendModalClose}
          onSelectCoin={onSendFtSelect}
          visible={openSendModal}
          coins={sendSheetCoinsList}
          title={t('SEND')}
          loadingWalletData={loadingStxWalletData || loadingBtcWalletData}
        />
        <CoinSelectModal
          onSelectBitcoin={onBuyBtcClick}
          onSelectStacks={onBuyStxClick}
          onClose={onBuyModalClose}
          onSelectCoin={onBuyModalClose}
          visible={openBuyModal}
          coins={[]}
          title={t('BUY')}
          loadingWalletData={loadingStxWalletData || loadingBtcWalletData}
        />
      </Container>
      <BottomBar tab="dashboard" />

      <BottomModal
        visible={!!showDataCollectionAlert}
        header=""
        onClose={handleDataCollectionDeny}
        overlayStylesOverriding={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        contentStylesOverriding={{
          width: 'auto',
          bottom: 'initial',
          borderRadius: theme.radius(3),
          margin: `0 ${theme.spacing(8)}px`,
        }}
      >
        <ModalContent>
          <ModalIcon src={dashboardIcon} alt="analytics" />
          <ModalTitle>{t('DATA_COLLECTION_POPUP.TITLE')}</ModalTitle>
          <ModalDescription>{t('DATA_COLLECTION_POPUP.DESCRIPTION')}</ModalDescription>
          <ModalControlsContainer>
            <ModalButtonContainer>
              <Button
                variant="secondary"
                title={t('DATA_COLLECTION_POPUP.DENY')}
                onClick={handleDataCollectionDeny}
              />
            </ModalButtonContainer>
            <ModalButtonContainer>
              <Button
                title={t('DATA_COLLECTION_POPUP.ALLOW')}
                onClick={handleDataCollectionAllow}
              />
            </ModalButtonContainer>
          </ModalControlsContainer>
        </ModalContent>
      </BottomModal>
    </>
  );
}

export default Home;
