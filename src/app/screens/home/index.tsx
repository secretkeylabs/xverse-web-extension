import dashboardIcon from '@assets/img/dashboard-icon.svg';
import ListDashes from '@assets/img/dashboard/list_dashes.svg';
import ArrowSwap from '@assets/img/icons/ArrowSwap.svg';
import AccountHeaderComponent from '@components/accountHeader';
import BottomModal from '@components/bottomModal';
import BottomBar from '@components/tabBar';
import {
  useGetBrc20FungibleTokens,
  useVisibleBrc20FungibleTokens,
} from '@hooks/queries/ordinals/useGetBrc20FungibleTokens';
import {
  useRuneFungibleTokensQuery,
  useVisibleRuneFungibleTokens,
} from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import {
  useGetSip10FungibleTokens,
  useVisibleSip10FungibleTokens,
} from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useAppConfig from '@hooks/queries/useAppConfig';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useFeeMultipliers from '@hooks/queries/useFeeMultipliers';
import useSpamTokens from '@hooks/queries/useSpamTokens';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useAvatarCleanup from '@hooks/useAvatarCleanup';
import useHasFeature from '@hooks/useHasFeature';
import useNotificationBanners from '@hooks/useNotificationBanners';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowDown, ArrowUp, Plus } from '@phosphor-icons/react';
import { animated, useTransition } from '@react-spring/web';
import CoinSelectModal from '@screens/home/coinSelectModal';
import {
  AnalyticsEvents,
  FeatureId,
  type FungibleToken,
  type FungibleTokenWithStates,
} from '@secretkeylabs/xverse-core';
import {
  changeShowDataCollectionAlertAction,
  setBrc20ManageTokensAction,
  setRunesManageTokensAction,
  setSip10ManageTokensAction,
  setSpamTokenAction,
} from '@stores/wallet/actions/actionCreators';
import Button from '@ui-library/button';
import SnackBar from '@ui-library/snackBar';
import type { CurrencyTypes } from '@utils/constants';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { optInMixPanel, optOutMixPanel, trackMixPanel } from '@utils/mixpanel';
import { sortFtByFiatBalance } from '@utils/tokens';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'styled-components';
import SquareButton from '../../components/squareButton';
import AnnouncementModal from './announcementModal';
import BalanceCard from './balanceCard';
import BannerCarousel from './bannerCarousel';
import {
  ButtonImage,
  ButtonText,
  ColumnContainer,
  Container,
  ModalButtonContainer,
  ModalContent,
  ModalControlsContainer,
  ModalDescription,
  ModalIcon,
  ModalTitle,
  RowButtonContainer,
  StyledDivider,
  StyledDividerSingle,
  StyledTokenTile,
  TokenListButton,
  TokenListButtonContainer,
} from './index.styled';
import ReceiveSheet from './receiveSheet';

function Home() {
  const { t } = useTranslation('translation', {
    keyPrefix: 'DASHBOARD_SCREEN',
  });
  const selectedAccount = useSelectedAccount();
  const { stxAddress, btcAddress } = selectedAccount;
  const { showDataCollectionAlert, hideStx, spamToken, notificationBanners } = useWalletSelector();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openReceiveModal, setOpenReceiveModal] = useState(false);
  const [openSendModal, setOpenSendModal] = useState(false);
  const [openBuyModal, setOpenBuyModal] = useState(false);
  const { isInitialLoading: loadingBtcWalletData, isRefetching: refetchingBtcWalletData } =
    useBtcWalletData();
  const { isInitialLoading: loadingStxWalletData, isRefetching: refetchingStxWalletData } =
    useStxWalletData();
  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();
  const { data: notificationBannersArr, isFetching: isFetchingNotificationBannersArr } =
    useNotificationBanners();

  const { data: fullSip10CoinsList } = useGetSip10FungibleTokens();
  const { data: fullBrc20CoinsList } = useGetBrc20FungibleTokens();
  const { data: fullRunesCoinsList } = useRuneFungibleTokensQuery();
  const {
    data: sip10CoinsList,
    isInitialLoading: loadingStxCoinData,
    isRefetching: refetchingStxCoinData,
  } = useVisibleSip10FungibleTokens();
  const {
    data: brc20CoinsList,
    isInitialLoading: loadingBrcCoinData,
    isRefetching: refetchingBrcCoinData,
  } = useVisibleBrc20FungibleTokens();
  const {
    data: runesCoinsList,
    isInitialLoading: loadingRunesData,
    isRefetching: refetchingRunesData,
  } = useVisibleRuneFungibleTokens();

  useFeeMultipliers();
  useAppConfig();
  useAvatarCleanup();
  useTrackMixPanelPageViewed();
  const { removeFromSpamTokens } = useSpamTokens();

  useEffect(
    () => () => {
      toast.dismiss();
    },
    [],
  );

  useEffect(() => {
    if (spamToken) {
      const toastId = toast.custom(
        <SnackBar
          text={t('TOKEN_HIDDEN')}
          type="neutral"
          dismissToast={() => toast.remove(toastId)}
          action={{
            text: t('UNDO'),
            onClick: () => {
              toast.remove(toastId);

              // set the visibility back to true
              const payload = {
                principal: spamToken.principal,
                isEnabled: true,
              };

              if (
                fullRunesCoinsList?.find(
                  (ft: FungibleTokenWithStates) => ft.principal === spamToken.principal,
                )
              ) {
                dispatch(setRunesManageTokensAction(payload));
              } else if (
                fullSip10CoinsList?.find(
                  (ft: FungibleTokenWithStates) => ft.principal === spamToken.principal,
                )
              ) {
                dispatch(setSip10ManageTokensAction(payload));
              } else if (
                fullBrc20CoinsList?.find(
                  (ft: FungibleTokenWithStates) => ft.principal === spamToken.principal,
                )
              ) {
                dispatch(setBrc20ManageTokensAction(payload));
              }

              removeFromSpamTokens(spamToken.principal);
              dispatch(setSpamTokenAction(null));
            },
          }}
        />,
      );
      dispatch(setSpamTokenAction(null));
    }
  }, [spamToken]);

  const combinedFtList = (sip10CoinsList ?? [])
    .concat(brc20CoinsList ?? [])
    .concat(runesCoinsList ?? [])
    .sort((a: FungibleTokenWithStates, b: FungibleTokenWithStates) =>
      sortFtByFiatBalance(a, b, stxBtcRate, btcFiatRate),
    );

  const filteredNotificationBannersArr = notificationBannersArr
    ? notificationBannersArr.filter((banner) => !notificationBanners[banner.id])
    : [];
  const showBannerCarousel =
    !isFetchingNotificationBannersArr && !!filteredNotificationBannersArr?.length;

  const onReceiveModalOpen = () => {
    setOpenReceiveModal(true);
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

  const onSendFtSelect = async (fungibleToken: FungibleToken) => {
    let route = '';
    switch (fungibleToken?.protocol) {
      case 'stacks':
        route = `/send-stx?principal=${fungibleToken?.principal}`;
        break;
      case 'brc-20':
        route = `/send-brc20-one-step?principal=${fungibleToken?.principal}`;
        break;
      case 'runes':
        route = `/send-rune?principal=${fungibleToken?.principal}`;
        break;
      default:
        break;
    }

    if (isLedgerAccount(selectedAccount) && !isInOptions()) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`options.html#${route}`),
      });
    } else {
      navigate(route);
    }
  };

  const onBuyStxClick = () => {
    navigate('/buy/STX');
  };

  const onBuyBtcClick = () => {
    navigate('/buy/BTC');
  };

  const handleTokenPressed = (currency: CurrencyTypes, fungibleToken?: FungibleToken) => {
    if (fungibleToken) {
      navigate(
        `/coinDashboard/${currency}?ftKey=${fungibleToken.principal}&protocol=${fungibleToken.protocol}`,
      );
    } else {
      navigate(`/coinDashboard/${currency}`);
    }
  };

  const onSwapPressed = () => {
    trackMixPanel(AnalyticsEvents.InitiateSwapFlow, {});
    navigate('/swap');
  };

  const handleDataCollectionDeny = () => {
    optOutMixPanel();
    dispatch(changeShowDataCollectionAlertAction(false));
  };

  const handleDataCollectionAllow = () => {
    optInMixPanel(selectedAccount?.masterPubKey);
    dispatch(changeShowDataCollectionAlertAction(false));
  };

  const isCrossChainSwapsEnabled = useHasFeature(FeatureId.CROSS_CHAIN_SWAPS);
  const showSwaps = isCrossChainSwapsEnabled;

  const transitions = useTransition(showBannerCarousel, {
    from: { maxHeight: '1000px', opacity: 0.5 },
    enter: { maxHeight: '1000px', opacity: 1 },
    leave: { maxHeight: '0px', opacity: 0 },
    config: (item, index, phase) =>
      phase === 'leave'
        ? {
            duration: 300,
            easing: (progress) => 1 - (1 - progress) ** 4,
          }
        : {
            duration: 200,
          },
  });

  return (
    <>
      <AccountHeaderComponent />
      <Container>
        <BalanceCard
          isLoading={loadingStxWalletData || loadingBtcWalletData}
          isRefetching={
            refetchingBtcWalletData ||
            refetchingStxWalletData ||
            refetchingStxCoinData ||
            refetchingBrcCoinData ||
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

        {transitions((style, item) =>
          item ? (
            <animated.div style={style}>
              <br />
              <StyledDivider color="white_850" verticalMargin="m" />
              <BannerCarousel items={filteredNotificationBannersArr} />
              <StyledDivider
                color="white_850"
                verticalMargin="m"
                $noMarginBottom={filteredNotificationBannersArr.length === 1}
              />
            </animated.div>
          ) : (
            <animated.div style={style}>
              <StyledDividerSingle color="elevation3" verticalMargin="xl" />
            </animated.div>
          ),
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
          {combinedFtList.map((coin: FungibleTokenWithStates) => {
            const isLoading = loadingStxCoinData || loadingBrcCoinData || loadingRunesData;
            return (
              <StyledTokenTile
                key={coin.principal}
                title={coin.name}
                currency="FT"
                loading={isLoading}
                fungibleToken={coin}
                onPress={handleTokenPressed}
              />
            );
          })}
        </ColumnContainer>
        <TokenListButtonContainer>
          <TokenListButton onClick={handleManageTokenListOnClick}>
            <>
              <ButtonImage src={ListDashes} />
              <ButtonText>{t('MANAGE_TOKEN')}</ButtonText>
            </>
          </TokenListButton>
        </TokenListButtonContainer>

        <ReceiveSheet visible={openReceiveModal} onClose={() => setOpenReceiveModal(false)} />

        <CoinSelectModal
          onSelectBitcoin={onBtcSendClick}
          onSelectStacks={onStxSendClick}
          onClose={onSendModalClose}
          onSelectCoin={onSendFtSelect}
          visible={openSendModal}
          coins={combinedFtList}
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
        <AnnouncementModal />
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
