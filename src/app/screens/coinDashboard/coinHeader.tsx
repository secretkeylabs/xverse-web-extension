import ArrowDown from '@assets/img/dashboard/arrow_down.svg';
import ArrowUp from '@assets/img/dashboard/arrow_up.svg';
import Buy from '@assets/img/dashboard/black_plus.svg';
import List from '@assets/img/dashboard/list.svg';
import ArrowSwap from '@assets/img/icons/ArrowSwap.svg';
import Lock from '@assets/img/transactions/Lock.svg';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import SmallActionButton from '@components/smallActionButton';
import TokenImage from '@components/tokenImage';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useCoinRates from '@hooks/queries/useCoinRates';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useHasFeature from '@hooks/useHasFeature';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  FeatureId,
  FungibleToken,
  currencySymbolMap,
  getFiatEquivalent,
  microstacksToStx,
} from '@secretkeylabs/xverse-core';
import { CurrencyTypes } from '@utils/constants';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { getBalanceAmount, getFtTicker } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useNavigate } from 'react-router-dom';
import {
  AvailableStxContainer,
  BalanceInfoContainer,
  BalanceTitleText,
  BalanceValuesContainer,
  CoinBalanceText,
  Container,
  FiatAmountText,
  HeaderSeparator,
  LockedStxContainer,
  ProtocolText,
  RowButtonContainer,
  RowContainer,
  StacksLockedInfoText,
  StxLockedText,
  VerifyButtonContainer,
  VerifyOrViewContainer,
} from './coinHeader.styled';

type Props = {
  currency: CurrencyTypes;
  fungibleToken?: FungibleToken;
};

export default function CoinHeader({ currency, fungibleToken }: Props) {
  const selectedAccount = useSelectedAccount();
  const { fiatCurrency, network } = useWalletSelector();
  const { data: btcBalance } = useBtcWalletData();
  const { data: stxData } = useStxWalletData();
  const { btcFiatRate, stxBtcRate } = useCoinRates();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const [openReceiveModal, setOpenReceiveModal] = useState(false);
  const isReceivingAddressesVisible = !isLedgerAccount(selectedAccount);
  const showSwaps =
    useHasFeature(FeatureId.SWAPS) &&
    currency === 'STX' &&
    !isLedgerAccount(selectedAccount) &&
    network.type !== 'Testnet';

  const showRunesListing =
    useHasFeature(FeatureId.RUNES_LISTING) || process.env.NODE_ENV === 'development';

  const handleReceiveModalOpen = () => {
    setOpenReceiveModal(true);
  };

  const handleReceiveModalClose = () => {
    setOpenReceiveModal(false);
  };

  const getTokenTicker = () => {
    if (currency === 'STX' || currency === 'BTC') {
      return currency;
    }
    if (currency === 'FT' && fungibleToken) {
      return getFtTicker(fungibleToken);
    }
    return '';
  };

  const renderStackingBalances = () => {
    if (!new BigNumber(stxData?.locked ?? 0).eq(0) && currency === 'STX') {
      return (
        <>
          <HeaderSeparator />
          <Container>
            <LockedStxContainer>
              <img src={Lock} alt="locked" />
              <StacksLockedInfoText>{t('STX_LOCKED_BALANCE_PREFIX')}</StacksLockedInfoText>
              <NumericFormat
                value={microstacksToStx(new BigNumber(stxData?.locked ?? '0')).toString()}
                displayType="text"
                thousandSeparator
                renderText={(value: string) => <StxLockedText>{`${value} STX`}</StxLockedText>}
              />
            </LockedStxContainer>
            <AvailableStxContainer>
              <StacksLockedInfoText>{t('STX_AVAILABLE_BALANCE_PREFIX')}</StacksLockedInfoText>
              <NumericFormat
                value={microstacksToStx(new BigNumber(stxData?.availableBalance ?? 0)).toString()}
                displayType="text"
                thousandSeparator
                renderText={(value: string) => <StxLockedText>{`${value} STX`}</StxLockedText>}
              />
            </AvailableStxContainer>
          </Container>
        </>
      );
    }
  };

  const goToSendScreen = async () => {
    let route = '';
    if (currency === 'BTC' || currency === 'STX') {
      route = `/send-${currency}`;
    } else {
      switch (fungibleToken?.protocol) {
        case 'stacks':
          // TODO refactor to use principal
          route = `/send-sip10?ticker=${fungibleToken?.ticker}`;
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
    }

    if (isLedgerAccount(selectedAccount) && !isInOptions()) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`options.html#${route}`),
      });
    } else {
      navigate(route);
    }
  };

  const getDashboardTitle = () => {
    if (fungibleToken?.name) {
      return `${fungibleToken.name} ${t('BALANCE')}`;
    }

    if (!currency) {
      return '';
    }

    if (currency === 'STX') {
      return `Stacks ${t('BALANCE')}`;
    }
    if (currency === 'BTC') {
      return `Bitcoin ${t('BALANCE')}`;
    }
    return `${currency} ${t('BALANCE')}`;
  };

  return (
    <Container>
      <BalanceInfoContainer>
        <TokenImage
          currency={currency || undefined}
          loading={false}
          fungibleToken={fungibleToken || undefined}
        />
        <RowContainer>
          <BalanceTitleText data-testid="coin-title-text">{getDashboardTitle()}</BalanceTitleText>
          {fungibleToken?.protocol && (
            <ProtocolText>
              {fungibleToken?.protocol === 'stacks'
                ? 'SIP-10'
                : fungibleToken.protocol?.toUpperCase()}
            </ProtocolText>
          )}
        </RowContainer>
        <BalanceValuesContainer>
          <NumericFormat
            value={getBalanceAmount(currency, fungibleToken, stxData, btcBalance)}
            displayType="text"
            thousandSeparator
            renderText={(value: string) => (
              <CoinBalanceText data-testid="coin-balance">{`${value} ${getTokenTicker()}`}</CoinBalanceText>
            )}
          />
          <NumericFormat
            value={getFiatEquivalent(
              Number(getBalanceAmount(currency, fungibleToken, stxData, btcBalance)),
              currency,
              BigNumber(stxBtcRate),
              BigNumber(btcFiatRate),
              fungibleToken,
            )}
            displayType="text"
            thousandSeparator
            prefix={`${currencySymbolMap[fiatCurrency]}`}
            suffix={` ${fiatCurrency}`}
            renderText={(value) => <FiatAmountText>{value}</FiatAmountText>}
          />
        </BalanceValuesContainer>
      </BalanceInfoContainer>
      {renderStackingBalances()}
      <RowButtonContainer>
        <SmallActionButton src={ArrowUp} text={t('SEND')} onPress={() => goToSendScreen()} />
        {fungibleToken ? (
          <>
            <SmallActionButton
              src={ArrowDown}
              text={t('RECEIVE')}
              // RUNES & BRC20s => ordinal wallet, SIP-10 => STX wallet
              onPress={() =>
                navigate(`/receive/${fungibleToken?.protocol === 'stacks' ? 'STX' : 'ORD'}`)
              }
            />
            {showRunesListing && fungibleToken.protocol === 'runes' && (
              <SmallActionButton
                src={List}
                text={t('LIST')}
                onPress={() => navigate(`/list-rune/${fungibleToken.principal}`)}
              />
            )}
          </>
        ) : (
          <>
            <SmallActionButton
              src={ArrowDown}
              text={t('RECEIVE')}
              onPress={() => {
                if (isReceivingAddressesVisible) {
                  navigate(`/receive/${currency}`);
                } else {
                  handleReceiveModalOpen();
                }
              }}
            />
            {showSwaps && (
              <SmallActionButton
                src={ArrowSwap}
                text={t('SWAP')}
                onPress={() => navigate(`/swap?from=${currency}`)}
              />
            )}
            <SmallActionButton
              src={Buy}
              text={t('BUY')}
              onPress={() => navigate(`/buy/${currency}`)}
            />
          </>
        )}
      </RowButtonContainer>
      <BottomModal
        visible={openReceiveModal}
        header={t('RECEIVE')}
        onClose={handleReceiveModalClose}
      >
        <VerifyOrViewContainer>
          <VerifyButtonContainer>
            <ActionButton
              text={t('VERIFY_ADDRESS_ON_LEDGER')}
              onPress={async () => {
                await chrome.tabs.create({
                  url: chrome.runtime.getURL(
                    `options.html#/verify-ledger?currency=${
                      !fungibleToken
                        ? currency
                        : fungibleToken?.protocol === 'stacks'
                        ? 'STX'
                        : 'ORD'
                    }`,
                  ),
                });
              }}
            />
          </VerifyButtonContainer>
          <ActionButton
            transparent
            text={t('VIEW_ADDRESS')}
            onPress={() => {
              navigate(
                `/receive/${
                  !fungibleToken ? currency : fungibleToken?.protocol === 'stacks' ? 'STX' : 'ORD'
                }`,
              );
            }}
          />
        </VerifyOrViewContainer>
      </BottomModal>
    </Container>
  );
}
