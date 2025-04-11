import dashboardIcon from '@assets/img/dashboard-icon.svg';
import ArrowSwap from '@assets/img/icons/ArrowSwap.svg';
import AccountHeaderComponent from '@components/accountHeader';
import BottomModal from '@components/bottomModal';
import BottomBar from '@components/tabBar';
import TokenTileLoader from '@components/tokenTile/loader';
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
import useFeeMultipliers from '@hooks/queries/useFeeMultipliers';
import useSelectedAccountBtcBalance from '@hooks/queries/useSelectedAccountBtcBalance';
import useSpamTokens from '@hooks/queries/useSpamTokens';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useAvatarCleanup from '@hooks/useAvatarCleanup';
import useHasFeature from '@hooks/useHasFeature';
import useNotificationBanners from '@hooks/useNotificationBanners';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowDown, ArrowUp, ListDashes, Plus } from '@phosphor-icons/react';
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
import { ANIMATION_EASING, type CurrencyTypes } from '@utils/constants';
import { isInOptions, isKeystoneAccount, isLedgerAccount } from '@utils/helper';
import { optInMixPanel, optOutMixPanel, trackMixPanel } from '@utils/mixpanel';
import { sortFtByFiatBalance } from '@utils/tokens';
import RoutePaths from 'app/routes/paths';
import { useEffect, useRef, useState } from 'react';
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
  const { showDataCollectionAlert, hideStx, spamToken, notificationBanners, balanceHidden } =
    useWalletSelector();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openReceiveModal, setOpenReceiveModal] = useState(false);
  const [openSendModal, setOpenSendModal] = useState(false);
  const [openBuyModal, setOpenBuyModal] = useState(false);
  const {
    isLoading: isInitialLoadingBtc,
    isRefetching: refetchingBtcWalletData,
    failureCount: failureCountBtc,
    errorUpdateCount: errorUpdateCountBtc,
  } = useSelectedAccountBtcBalance();
  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();
  const { data: notificationBannersArr, isFetching: isFetchingNotificationBannersArr } =
    useNotificationBanners();

  // Fetching balances
  const { data: fullSip10CoinsList } = useGetSip10FungibleTokens();
  const { data: fullBrc20CoinsList } = useGetBrc20FungibleTokens();
  const { data: fullRunesCoinsList } = useRuneFungibleTokensQuery();
  const {
    isInitialLoading: isInitialLoadingStx,
    isRefetching: refetchingStxWalletData,
    failureCount: failureCountStx,
    errorUpdateCount: errorUpdateCountStx,
  } = useStxWalletData();
  const {
    data: sip10CoinsList,
    isInitialLoading: isInitialLoadingSip10,
    isRefetching: refetchingStxCoinData,
    failureCount: failureCountSip10,
    errorUpdateCount: errorUpdateCountSip10,
  } = useVisibleSip10FungibleTokens();
  const {
    data: brc20CoinsList,
    isInitialLoading: isInitialLoadingBrc20,
    isRefetching: refetchingBrcCoinData,
    failureCount: failureCountBrc20,
    errorUpdateCount: errorUpdateCountBrc20,
  } = useVisibleBrc20FungibleTokens();
  const {
    data: runesCoinsList,
    isInitialLoading: isInitialLoadingRunes,
    isRefetching: refetchingRunesData,
    errorUpdateCount: errorUpdateCountRunes,
    failureCount: failureCountRunes,
  } = useVisibleRuneFungibleTokens();

  const isInitialLoadingTokens =
    (isInitialLoadingSip10 && failureCountSip10 === 0 && errorUpdateCountSip10 === 0) ||
    (isInitialLoadingBrc20 && failureCountBrc20 === 0 && errorUpdateCountBrc20 === 0) ||
    (isInitialLoadingRunes && failureCountRunes === 0 && errorUpdateCountRunes === 0);

  const isInitialLoading =
    (isInitialLoadingBtc && failureCountBtc === 0 && errorUpdateCountBtc === 0) ||
    (isInitialLoadingStx && failureCountStx === 0 && errorUpdateCountStx === 0) ||
    isInitialLoadingTokens;

  const isRefetching =
    refetchingBtcWalletData ||
    refetchingStxWalletData ||
    refetchingStxCoinData ||
    refetchingBrcCoinData ||
    refetchingRunesData;

  useEffect(() => {
    const errorChecks = [
      {
        condition: failureCountBtc === 1 && errorUpdateCountBtc === 0,
        message: 'ERRORS.BTC_BALANCE',
      },
      {
        condition: failureCountStx === 1 && errorUpdateCountStx === 0,
        message: 'ERRORS.STX_BALANCE',
      },
      {
        condition: failureCountSip10 === 1 && errorUpdateCountSip10 === 0,
        message: 'ERRORS.SIP10_BALANCE',
      },
      {
        condition: failureCountBrc20 === 1 && errorUpdateCountBrc20 === 0,
        message: 'ERRORS.BRC20_BALANCE',
      },
      {
        condition: failureCountRunes === 1 && errorUpdateCountRunes === 0,
        message: 'ERRORS.RUNES_BALANCE',
      },
    ];

    errorChecks.forEach(({ condition, message }) => {
      if (condition) {
        toast.error(t(message));
      }
    });
  }, [
    t,
    failureCountBtc,
    errorUpdateCountBtc,
    failureCountStx,
    errorUpdateCountStx,
    failureCountSip10,
    errorUpdateCountSip10,
    failureCountBrc20,
    errorUpdateCountBrc20,
    failureCountRunes,
    errorUpdateCountRunes,
  ]);

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
      const toastId = toast(
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
    trackMixPanel(AnalyticsEvents.InitiateSendFlow, {
      selectedToken: 'STX',
      source: 'dashboard',
    });
    if (isLedgerAccount(selectedAccount) && !isInOptions()) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`options.html#${RoutePaths.SendStx}`),
      });
      return;
    }
    navigate(RoutePaths.SendStx);
  };

  const onBtcSendClick = async () => {
    trackMixPanel(AnalyticsEvents.InitiateSendFlow, {
      selectedToken: 'BTC',
      source: 'send_btc',
    });
    if (
      (isLedgerAccount(selectedAccount) || isKeystoneAccount(selectedAccount)) &&
      !isInOptions()
    ) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`options.html#${RoutePaths.SendBtc}`),
      });
      return;
    }
    navigate(RoutePaths.SendBtc);
  };

  const onSendFtSelect = async (fungibleToken: FungibleToken) => {
    let route = '';
    switch (fungibleToken?.protocol) {
      case 'stacks':
        route = `${RoutePaths.SendStx}?principal=${fungibleToken?.principal}`;
        break;
      case 'brc-20':
        route = `${RoutePaths.SendBrc20OneStep}?principal=${fungibleToken?.principal}`;
        break;
      case 'runes':
        route = `${RoutePaths.SendRune}?principal=${fungibleToken?.principal}`;
        break;
      default:
        break;
    }

    if (
      (isLedgerAccount(selectedAccount) || isKeystoneAccount(selectedAccount)) &&
      !isInOptions()
    ) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`options.html#${route}`),
      });
    } else {
      navigate(route);
    }
  };

  const onBuyStxClick = () => {
    trackMixPanel(AnalyticsEvents.InitiateBuyFlow, {
      selectedToken: 'STX',
      source: 'dashboard',
    });
    navigate('/buy/STX');
  };

  const onBuyBtcClick = () => {
    trackMixPanel(AnalyticsEvents.InitiateBuyFlow, {
      selectedToken: 'BTC',
      source: 'dashboard',
    });
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

  const isInitialMount = useRef(true);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  const isCrossChainSwapsEnabled = useHasFeature(FeatureId.CROSS_CHAIN_SWAPS);
  const showSwaps = isCrossChainSwapsEnabled;

  const loaderTransitions = useTransition(isInitialLoading, {
    from: { opacity: isInitialMount.current ? 1 : 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: {
      duration: 400,
      easing: ANIMATION_EASING,
    },
    exitBeforeEnter: true, // This ensures the leave animation completes before the enter animation starts
  });

  const bannerTransitions = useTransition(showBannerCarousel && !isInitialLoading, {
    from: { maxHeight: '102px', opacity: isInitialMount.current ? 1 : 0 },
    enter: { maxHeight: '102px', opacity: 1 },
    leave: { maxHeight: '0px', opacity: 0 },
    config: {
      duration: 400,
      easing: ANIMATION_EASING,
    },
    exitBeforeEnter: true, // This ensures the leave animation completes before the enter animation starts
  });

  return (
    <>
      <AccountHeaderComponent />
      <Container>
        <BalanceCard
          isLoading={isInitialLoading}
          isRefetching={isRefetching}
          combinedFtList={combinedFtList}
        />
        <RowButtonContainer data-testid="transaction-buttons-row">
          <SquareButton
            icon={<ArrowUp weight="regular" size="20" />}
            text={t('SEND')}
            onPress={onSendModalOpen}
            disabled={isInitialLoading}
          />
          <SquareButton
            icon={<ArrowDown weight="regular" size="20" />}
            text={t('RECEIVE')}
            onPress={onReceiveModalOpen}
            disabled={isInitialLoading}
          />
          {showSwaps && (
            <SquareButton
              src={ArrowSwap}
              text={t('SWAP')}
              onPress={onSwapPressed}
              disabled={isInitialLoading}
            />
          )}
          <SquareButton
            icon={<Plus weight="regular" size="20" />}
            text={t('BUY')}
            onPress={onBuyModalOpen}
            disabled={isInitialLoading}
          />
        </RowButtonContainer>

        {bannerTransitions((style, item) =>
          item ? (
            <animated.div style={style}>
              <StyledDivider color="white_850" $verticalMargin="m" $noMarginTop />
              <BannerCarousel items={filteredNotificationBannersArr} />
              <StyledDivider
                color="white_850"
                $verticalMargin="m"
                $noMarginBottom={filteredNotificationBannersArr.length === 1}
              />
            </animated.div>
          ) : (
            <animated.div style={style}>
              <StyledDivider color="elevation3" />
            </animated.div>
          ),
        )}

        <ColumnContainer>
          {loaderTransitions((style, loading) =>
            loading ? (
              <animated.div style={style}>
                <TokenTileLoader />
                <TokenTileLoader />
                <TokenTileLoader />
                <TokenTileLoader />
              </animated.div>
            ) : (
              <animated.div style={style}>
                {btcAddress && (
                  <StyledTokenTile
                    title={t('BITCOIN')}
                    currency="BTC"
                    loading={isInitialLoadingBtc}
                    onPress={handleTokenPressed}
                  />
                )}
                {stxAddress && !hideStx && (
                  <StyledTokenTile
                    title={t('STACKS')}
                    currency="STX"
                    loading={isInitialLoadingStx}
                    onPress={handleTokenPressed}
                  />
                )}
                {combinedFtList.map((coin) => (
                  <StyledTokenTile
                    key={coin.principal}
                    title={coin.name}
                    currency="FT"
                    loading={isInitialLoadingTokens}
                    fungibleToken={coin}
                    onPress={handleTokenPressed}
                  />
                ))}
              </animated.div>
            ),
          )}
        </ColumnContainer>
        <TokenListButtonContainer>
          <TokenListButton onClick={handleManageTokenListOnClick}>
            <ListDashes size={20} />
            {t('MANAGE_TOKEN')}
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
          loadingWalletData={isInitialLoadingStx || isInitialLoadingBtc}
        />
        <CoinSelectModal
          onSelectBitcoin={onBuyBtcClick}
          onSelectStacks={onBuyStxClick}
          onClose={onBuyModalClose}
          onSelectCoin={onBuyModalClose}
          visible={openBuyModal}
          coins={[]}
          title={t('BUY')}
          loadingWalletData={isInitialLoadingStx || isInitialLoadingBtc}
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
