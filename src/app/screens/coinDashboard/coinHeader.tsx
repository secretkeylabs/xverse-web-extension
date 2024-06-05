import ArrowDown from '@assets/img/dashboard/arrow_down.svg';
import ArrowUp from '@assets/img/dashboard/arrow_up.svg';
import Buy from '@assets/img/dashboard/black_plus.svg';
import ArrowSwap from '@assets/img/icons/ArrowSwap.svg';
import Lock from '@assets/img/transactions/Lock.svg';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import SmallActionButton from '@components/smallActionButton';
import TokenImage from '@components/tokenImage';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useCoinRates from '@hooks/queries/useCoinRates';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  currencySymbolMap,
  FungibleToken,
  microstacksToStx,
  satsToBtc,
} from '@secretkeylabs/xverse-core';
import { CurrencyTypes } from '@utils/constants';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { getFtBalance, getFtTicker } from '@utils/tokens';
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
  RecieveButtonContainer,
  RowButtonContainer,
  RowContainer,
  StacksLockedInfoText,
  StxLockedText,
  VerifyButtonContainer,
  VerifyOrViewContainer,
} from './coinHeader.styled';

interface Props {
  coin: CurrencyTypes;
  fungibleToken?: FungibleToken;
}

export default function CoinHeader({ coin, fungibleToken }: Props) {
  const { fiatCurrency, selectedAccount, network } = useWalletSelector();
  const { data: btcBalance } = useBtcWalletData();
  const { data: stxData } = useStxWalletData();
  const { btcFiatRate, stxBtcRate } = useCoinRates();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const [openReceiveModal, setOpenReceiveModal] = useState(false);
  const isReceivingAddressesVisible = !isLedgerAccount(selectedAccount);
  const showSwaps =
    coin === 'STX' && !isLedgerAccount(selectedAccount) && network.type !== 'Testnet';

  const handleReceiveModalOpen = () => {
    setOpenReceiveModal(true);
  };

  const handleReceiveModalClose = () => {
    setOpenReceiveModal(false);
  };

  const getBalanceAmount = () => {
    switch (coin) {
      case 'STX':
        return microstacksToStx(new BigNumber(stxData?.balance ?? 0)).toString();
      case 'BTC':
        return satsToBtc(new BigNumber(btcBalance ?? 0)).toString();
      default:
        return fungibleToken ? getFtBalance(fungibleToken) : '';
    }
  };

  const getFtFiatEquivalent = () => {
    if (fungibleToken?.tokenFiatRate) {
      const balance = new BigNumber(getFtBalance(fungibleToken));
      const rate = new BigNumber(fungibleToken.tokenFiatRate);
      return balance.multipliedBy(rate).toFixed(2).toString();
    }
    return '';
  };

  const getTokenTicker = () => {
    if (coin === 'STX' || coin === 'BTC') {
      return coin;
    }
    if (coin === 'FT' && fungibleToken) {
      return getFtTicker(fungibleToken);
    }
    return '';
  };

  const getFiatEquivalent = () => {
    switch (coin) {
      case 'STX':
        return microstacksToStx(new BigNumber(stxData?.balance ?? '0'))
          .multipliedBy(new BigNumber(stxBtcRate))
          .multipliedBy(new BigNumber(btcFiatRate))
          .toFixed(2)
          .toString();
      case 'BTC':
        return satsToBtc(new BigNumber(btcBalance ?? 0))
          .multipliedBy(new BigNumber(btcFiatRate))
          .toFixed(2)
          .toString();
      case 'FT':
        return getFtFiatEquivalent();
      default:
        return '';
    }
  };

  const renderStackingBalances = () => {
    if (!new BigNumber(stxData?.locked ?? 0).eq(0) && coin === 'STX') {
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
    if (isLedgerAccount(selectedAccount) && !isInOptions()) {
      switch (coin) {
        case 'BTC':
          await chrome.tabs.create({
            url: chrome.runtime.getURL('options.html#/send-btc'),
          });
          return;
        case 'STX':
          await chrome.tabs.create({
            url: chrome.runtime.getURL('options.html#/send-stx'),
          });
          return;
        default:
          break;
      }
      switch (fungibleToken?.protocol) {
        case 'stacks':
          await chrome.tabs.create({
            url: chrome.runtime.getURL(
              `options.html#/send-sip10?coinTicker=${fungibleToken?.ticker}`,
            ),
          });
          return;
        case 'brc-20':
          // TODO replace with send-brc20-one-step route, when ledger support is ready
          await chrome.tabs.create({
            url: chrome.runtime.getURL(
              `options.html#/send-brc20?coinTicker=${fungibleToken?.ticker}`,
            ),
          });
          return;
        case 'runes':
          await chrome.tabs.create({
            url: chrome.runtime.getURL(`options.html#/send-rune?coinTicker=${fungibleToken?.name}`),
          });
          return;
        default:
          break;
      }
    }
    switch (coin) {
      case 'BTC':
      case 'STX':
        navigate(`/send-${coin}`);
        break;
      default:
        break;
    }
    switch (fungibleToken?.protocol) {
      case 'stacks':
        navigate('/send-sip10', {
          state: {
            fungibleToken,
          },
        });
        break;
      case 'brc-20':
        navigate('/send-brc20-one-step', {
          state: {
            fungibleToken,
          },
        });
        break;
      case 'runes':
        navigate('/send-rune', {
          state: {
            fungibleToken,
          },
        });
        break;
      default:
        break;
    }
  };

  const getDashboardTitle = () => {
    if (fungibleToken?.name) {
      return `${fungibleToken.name} ${t('BALANCE')}`;
    }

    if (!coin) {
      return '';
    }

    if (coin === 'STX') {
      return `Stacks ${t('BALANCE')}`;
    }
    if (coin === 'BTC') {
      return `Bitcoin ${t('BALANCE')}`;
    }
    return `${coin} ${t('BALANCE')}`;
  };

  return (
    <Container>
      <BalanceInfoContainer>
        <TokenImage
          currency={coin || undefined}
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
            value={getBalanceAmount()}
            displayType="text"
            thousandSeparator
            renderText={(value: string) => (
              <CoinBalanceText data-testid="coin-balance">{`${value} ${getTokenTicker()}`}</CoinBalanceText>
            )}
          />
          <NumericFormat
            value={getFiatEquivalent()}
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
        {/* ENG-4020 - Disable BRC20 Sending on Ledger */}
        {!(fungibleToken?.protocol === 'brc-20' && isLedgerAccount(selectedAccount)) && (
          <SmallActionButton src={ArrowUp} text={t('SEND')} onPress={() => goToSendScreen()} />
        )}
        {!fungibleToken ? (
          <>
            <SmallActionButton
              src={ArrowDown}
              text={t('RECEIVE')}
              onPress={() => {
                if (isReceivingAddressesVisible) {
                  navigate(`/receive/${coin}`);
                } else {
                  handleReceiveModalOpen();
                }
              }}
            />
            {showSwaps && (
              <SmallActionButton
                src={ArrowSwap}
                text={t('SWAP')}
                onPress={() => navigate(`/swap?from=${coin}`)}
              />
            )}
            <SmallActionButton src={Buy} text={t('BUY')} onPress={() => navigate(`/buy/${coin}`)} />
          </>
        ) : (
          <RecieveButtonContainer>
            <SmallActionButton
              src={ArrowDown}
              text={t('RECEIVE')}
              // RUNES & BRC20s => ordinal wallet, SIP-10 => STX wallet
              onPress={() =>
                navigate(`/receive/${fungibleToken?.protocol === 'stacks' ? 'STX' : 'ORD'}`)
              }
            />
          </RecieveButtonContainer>
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
                      !fungibleToken ? coin : fungibleToken?.protocol === 'stacks' ? 'STX' : 'ORD'
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
                  !fungibleToken ? coin : fungibleToken?.protocol === 'stacks' ? 'STX' : 'ORD'
                }`,
              );
            }}
          />
        </VerifyOrViewContainer>
      </BottomModal>
    </Container>
  );
}
