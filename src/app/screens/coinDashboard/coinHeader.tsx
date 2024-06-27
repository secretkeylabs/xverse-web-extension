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
import useHasFeature from '@hooks/useHasFeature';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  FungibleToken,
  currencySymbolMap,
  getFiatEquivalent,
  microstacksToStx,
  satsToBtc,
} from '@secretkeylabs/xverse-core';
import { CurrencyTypes } from '@utils/constants';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { getBalanceAmount, getFtBalance, getFtTicker } from '@utils/tokens';
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
  currency: CurrencyTypes;
  fungibleToken?: FungibleToken;
}

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
    useHasFeature('SWAPS') &&
    currency === 'STX' &&
    !isLedgerAccount(selectedAccount) &&
    network.type !== 'Testnet';

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
    if (isLedgerAccount(selectedAccount) && !isInOptions()) {
      switch (currency) {
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
          await chrome.tabs.create({
            url: chrome.runtime.getURL(
              `options.html#/send-brc20-one-step?coinName=${fungibleToken?.ticker}`,
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
    switch (currency) {
      case 'BTC':
      case 'STX':
        navigate(`/send-${currency}`);
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
        {!fungibleToken ? (
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
