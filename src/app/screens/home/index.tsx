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
import { useVisibleBrc20FungibleTokens } from '@hooks/queries/ordinals/useGetBrc20FungibleTokens';
import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useAppConfig from '@hooks/queries/useAppConfig';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useCoinRates from '@hooks/queries/useCoinRates';
import useFeeMultipliers from '@hooks/queries/useFeeMultipliers';
import useSpamTokens from '@hooks/queries/useSpamTokens';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useHasFeature from '@hooks/useHasFeature';
import useNotificationBanners from '@hooks/useNotificationBanners';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowDown, ArrowUp, Plus } from '@phosphor-icons/react';
import CoinSelectModal from '@screens/home/coinSelectModal';
import { AnalyticsEvents, FeatureId, type FungibleToken } from '@secretkeylabs/xverse-core';
import {
  changeShowDataCollectionAlertAction,
  setBrc20ManageTokensAction,
  setRunesManageTokensAction,
  setSip10ManageTokensAction,
  setSpamTokenAction,
} from '@stores/wallet/actions/actionCreators';
import Button from '@ui-library/button';
import Sheet from '@ui-library/sheet';
import SnackBar from '@ui-library/snackBar';
import type { CurrencyTypes } from '@utils/constants';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { optInMixPanel, optOutMixPanel, trackMixPanel } from '@utils/mixpanel';
import { sortFtByFiatBalance } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'styled-components';
import SquareButton from '../../components/squareButton';
import BalanceCard from './balanceCard';
import BannerCarousel from './bannerCarousel';
import {
  ButtonImage,
  ButtonText,
  ColumnContainer,
  Container,
  Icon,
  IconBackground,
  MergedIcon,
  MergedOrdinalsIcon,
  ModalButtonContainer,
  ModalContent,
  ModalControlsContainer,
  ModalDescription,
  ModalIcon,
  ModalTitle,
  ReceiveContainer,
  RowButtonContainer,
  StacksIcon,
  StyledDivider,
  StyledDividerSingle,
  StyledTokenTile,
  TokenListButton,
  TokenListButtonContainer,
  VerifyButtonContainer,
  VerifyOrViewContainer,
} from './index.styled';

function Home() {
  const { t } = useTranslation('translation', {
    keyPrefix: 'DASHBOARD_SCREEN',
  });
  const selectedAccount = useSelectedAccount();
  const { stxAddress, btcAddress, ordinalsAddress } = selectedAccount;
  const {
    showBtcReceiveAlert,
    showOrdinalReceiveAlert,
    showDataCollectionAlert,
    hideStx,
    spamToken,
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
  const { isInitialLoading: loadingBtcWalletData, isRefetching: refetchingBtcWalletData } =
    useBtcWalletData();
  const { isInitialLoading: loadingStxWalletData, isRefetching: refetchingStxWalletData } =
    useStxWalletData();
  const { btcFiatRate, stxBtcRate } = useCoinRates();
  const { data: notificationBannersArr, isFetching: isFetchingNotificationBannersArr } =
    useNotificationBanners();
  const {
    unfilteredData: fullSip10CoinsList,
    visible: sip10CoinsList,
    isInitialLoading: loadingStxCoinData,
    isRefetching: refetchingStxCoinData,
  } = useVisibleSip10FungibleTokens();
  const {
    unfilteredData: fullBrc20CoinsList,
    visible: brc20CoinsList,
    isInitialLoading: loadingBrcCoinData,
    isRefetching: refetchingBrcCoinData,
  } = useVisibleBrc20FungibleTokens();
  const {
    unfilteredData: fullRunesCoinsList,
    visible: runesCoinsList,
    isInitialLoading: loadingRunesData,
    isRefetching: refetchingRunesData,
  } = useVisibleRuneFungibleTokens();

  useFeeMultipliers();
  useAppConfig();
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

              if (fullRunesCoinsList?.find((ft) => ft.principal === spamToken.principal)) {
                dispatch(setRunesManageTokensAction(payload));
              } else if (fullSip10CoinsList?.find((ft) => ft.principal === spamToken.principal)) {
                dispatch(setSip10ManageTokensAction(payload));
              } else if (fullBrc20CoinsList?.find((ft) => ft.principal === spamToken.principal)) {
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

  const combinedFtList = sip10CoinsList
    .concat(brc20CoinsList)
    .concat(runesCoinsList)
    .sort((a, b) => sortFtByFiatBalance(a, b, stxBtcRate, btcFiatRate));

  const filteredNotificationBannersArr = notificationBannersArr
    ? notificationBannersArr.filter((banner) => !notificationBanners[banner.id])
    : [];
  const showBannerCarousel =
    !isFetchingNotificationBannersArr && !!filteredNotificationBannersArr?.length;

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

  const handleTokenPressed = (currency: CurrencyTypes, fungibleToken?: FungibleToken) => {
    if (fungibleToken) {
      navigate(
        `/coinDashboard/${currency}?ftKey=${fungibleToken.principal}&protocol=${fungibleToken.protocol}`,
      );
    } else {
      navigate(`/coinDashboard/${currency}`);
    }
  };

  const onOrdinalsReceivePress = () => {
    navigate('/receive/ORD');
  };

  const onSwapPressed = () => {
    trackMixPanel(AnalyticsEvents.InitiateSwapFlow, {});
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

  const isCrossChainSwapsEnabled = useHasFeature(FeatureId.CROSS_CHAIN_SWAPS);
  const showSwaps = isCrossChainSwapsEnabled;

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

        {showBannerCarousel ? (
          <>
            <br />
            <StyledDivider color="white_850" verticalMargin="m" />
            <BannerCarousel items={filteredNotificationBannersArr} />
            <StyledDivider color="white_850" verticalMargin="xxs" />
          </>
        ) : (
          <StyledDividerSingle color="elevation3" verticalMargin="xs" />
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
          {combinedFtList.map((coin) => {
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
        <Sheet visible={openReceiveModal} title={t('RECEIVE')} onClose={onReceiveModalClose}>
          {areReceivingAddressesVisible ? receiveContent : verifyOrViewAddresses}
        </Sheet>
        <CoinSelectModal
          onSelectBitcoin={onBtcSendClick}
          onSelectStacks={onStxSendClick}
          onClose={onSendModalClose}
          onSelectCoin={onSendFtSelect}
          visible={openSendModal}
          coins={combinedFtList.filter((ft) => new BigNumber(ft.balance).gt(0))}
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
