import TokenImage from '@components/tokenImage';
import ArrowDown from '@assets/img/dashboard/arrow_down.svg';
import ArrowUp from '@assets/img/dashboard/arrow_up.svg';
import Lock from '@assets/img/transactions/Lock.svg';
import Buy from '@assets/img/dashboard/black_plus.svg';
import useWalletSelector from '@hooks/useWalletSelector';
import { FungibleToken, microstacksToStx, satsToBtc } from '@secretkeylabs/xverse-core';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import { CurrencyTypes } from '@utils/constants';
import { getFtBalance, getFtTicker } from '@utils/tokens';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isLedgerAccount } from '@utils/helper';
import SmallActionButton from '@components/smallActionButton';
import { useState } from 'react';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';

interface CoinBalanceProps {
  coin: CurrencyTypes;
  fungibleToken?: FungibleToken;
}

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
});

const ProtocolText = styled.p((props) => ({
  ...props.theme.headline_category_s,
  fontWeight: '700',
  height: 15,
  marginTop: 6,
  textTransform: 'uppercase',
  marginLeft: props.theme.spacing(2),
  backgroundColor: props.theme.colors.white['400'],
  padding: '1px 6px 1px',
  color: props.theme.colors.background.elevation0,
  borderRadius: props.theme.radius(2),
}));

const BalanceInfoContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const BalanceValuesContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const CoinBalanceText = styled.h1((props) => ({
  ...props.theme.headline_l,
  fontSize: 24,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const FiatAmountText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['200'],
  fontSize: 14,
  marginTop: props.theme.spacing(2),
  textAlign: 'center',
}));

const BalanceTitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['400'],
  textAlign: 'center',
  marginTop: props.theme.spacing(4),
}));

const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: props.theme.spacing(11),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  marginRight: props.theme.spacing(12),
}));

const RecieveButtonContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const HeaderSeparator = styled.div((props) => ({
  border: `0.5px solid ${props.theme.colors.white[400]}`,
  width: '50%',
  alignSelf: 'center',
  marginTop: props.theme.spacing(8),
  marginBottom: props.theme.spacing(8),
}));

const StxLockedText = styled.p((props) => ({
  ...props.theme.body_medium_m,
}));

const LockedStxContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  span: {
    color: props.theme.colors.white[400],
    marginRight: props.theme.spacing(3),
  },
  img: {
    marginRight: props.theme.spacing(3),
  },
}));

const AvailableStxContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: props.theme.spacing(4),
  span: {
    color: props.theme.colors.white[400],
    marginRight: props.theme.spacing(3),
  },
}));

const VerifyOrViewContainer = styled.div((props) => ({
  margin: props.theme.spacing(8),
  marginTop: props.theme.spacing(16),
  marginBottom: props.theme.spacing(20),
}));

const VerifyButtonContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(6),
}));

const StacksLockedInfoText = styled.span((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[400],
  textAlign: 'left',
}));

export default function CoinHeader(props: CoinBalanceProps) {
  const { coin, fungibleToken } = props;
  const {
    btcBalance,
    stxBalance,
    fiatCurrency,
    stxBtcRate,
    btcFiatRate,
    stxLockedBalance,
    stxAvailableBalance,
    selectedAccount,
  } = useWalletSelector();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const [openReceiveModal, setOpenReceiveModal] = useState(false);
  const isReceivingAddressesVisible = !isLedgerAccount(selectedAccount);

  const handleReceiveModalOpen = () => {
    setOpenReceiveModal(true);
  };

  const handleReceiveModalClose = () => {
    setOpenReceiveModal(false);
  };

  function getBalanceAmount() {
    switch (coin) {
      case 'STX':
        return microstacksToStx(new BigNumber(stxBalance)).toString();
      case 'BTC':
        return satsToBtc(new BigNumber(btcBalance)).toString();
      default:
        return fungibleToken ? getFtBalance(fungibleToken) : '';
    }
  }

  function getFtFiatEquivalent() {
    if (fungibleToken?.tokenFiatRate) {
      const balance = new BigNumber(getFtBalance(fungibleToken));
      const rate = new BigNumber(fungibleToken.tokenFiatRate);
      return balance.multipliedBy(rate).toFixed(2).toString();
    }
    return '';
  }

  const getTokenTicker = () => {
    if (coin === 'STX' || coin === 'BTC') {
      return coin;
    }
    if (coin === 'FT' && fungibleToken) {
      return getFtTicker(fungibleToken);
    }
    return '';
  };

  function getFiatEquivalent() {
    switch (coin) {
      case 'STX':
        return microstacksToStx(new BigNumber(stxBalance))
          .multipliedBy(new BigNumber(stxBtcRate))
          .multipliedBy(new BigNumber(btcFiatRate))
          .toFixed(2)
          .toString();
      case 'BTC':
        return satsToBtc(new BigNumber(btcBalance))
          .multipliedBy(new BigNumber(btcFiatRate))
          .toFixed(2)
          .toString();
      case 'FT':
        return getFtFiatEquivalent();
      default:
        return '';
    }
  }

  const renderStackingBalances = () => {
    if (stxLockedBalance && !new BigNumber(stxLockedBalance).eq(0, 10) && coin === 'STX') {
      return (
        <>
          <HeaderSeparator />
          <Container>
            <LockedStxContainer>
              <img src={Lock} alt="locked" />
              <StacksLockedInfoText>{t('STX_LOCKED_BALANCE_PREFIX')}</StacksLockedInfoText>
              <NumericFormat
                value={microstacksToStx(new BigNumber(stxLockedBalance)).toString()}
                displayType="text"
                thousandSeparator
                renderText={(value: string) => <StxLockedText>{`${value} STX`}</StxLockedText>}
              />
            </LockedStxContainer>
            <AvailableStxContainer>
              <StacksLockedInfoText>{t('STX_AVAILABLE_BALANCE_PREFIX')}</StacksLockedInfoText>
              <NumericFormat
                value={microstacksToStx(new BigNumber(stxAvailableBalance)).toString()}
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
    if (isLedgerAccount(selectedAccount)) {
      switch (coin) {
        case 'BTC':
          await chrome.tabs.create({
            url: chrome.runtime.getURL('options.html#/send-btc'),
          });
          return;
        case 'STX':
          await chrome.tabs.create({
            url: chrome.runtime.getURL('options.html#/send-stx-ledger'),
          });
          return;
        case 'FT':
          await chrome.tabs.create({
            url: chrome.runtime.getURL(`options.html#/send-ft-ledger?coin=${fungibleToken?.name}`),
          });
          return;
        case 'brc20':
          await chrome.tabs.create({
            url: chrome.runtime.getURL(`options.html#/send-brc20?coinName=${fungibleToken?.name}`),
          });
          return;
        default:
          break;
      }
    }
    if (coin === 'STX' || coin === 'BTC') {
      navigate(`/send-${coin}`);
    } else if (coin === 'FT') {
      navigate('/send-ft', {
        state: {
          fungibleToken,
        },
      });
    } else if (coin === 'brc20') {
      navigate('/send-brc20', {
        state: {
          fungibleToken,
        },
      });
    }
  };

  const getDashboardTitle = () => {
    if (fungibleToken) {
      return `${getFtTicker(fungibleToken)} ${t('BALANCE')}`;
    }
    if (coin) {
      return `${coin} ${t('BALANCE')}`;
    }
    return '';
  };

  const verifyOrViewAddresses = (
    <VerifyOrViewContainer>
      <VerifyButtonContainer>
        <ActionButton
          text="Verify address on Ledger"
          onPress={async () => {
            await chrome.tabs.create({
              url: chrome.runtime.getURL(`options.html#/verify-ledger?currency=${coin}`),
            });
          }}
        />
      </VerifyButtonContainer>
      <ActionButton
        transparent
        text="View address"
        onPress={() => {
          navigate(`/receive/${coin}`);
        }}
      />
    </VerifyOrViewContainer>
  );

  return (
    <Container>
      <BalanceInfoContainer>
        <TokenImage
          token={coin || undefined}
          loading={false}
          fungibleToken={fungibleToken || undefined}
        />
        <RowContainer>
          <BalanceTitleText>{getDashboardTitle()}</BalanceTitleText>
          {coin === 'brc20' && <ProtocolText>BRC-20</ProtocolText>}
        </RowContainer>
        <BalanceValuesContainer>
          <NumericFormat
            value={getBalanceAmount()}
            displayType="text"
            thousandSeparator
            renderText={(value: string) => (
              <CoinBalanceText>{`${value} ${getTokenTicker()}`}</CoinBalanceText>
            )}
          />
          <NumericFormat
            value={getFiatEquivalent()}
            displayType="text"
            thousandSeparator
            prefix={`${currencySymbolMap[fiatCurrency]} `}
            suffix={` ${fiatCurrency}`}
            renderText={(value) => <FiatAmountText>{value}</FiatAmountText>}
          />
        </BalanceValuesContainer>
      </BalanceInfoContainer>
      {renderStackingBalances()}
      <RowButtonContainer>
        <ButtonContainer>
          <SmallActionButton src={ArrowUp} text="Send" onPress={() => goToSendScreen()} />
        </ButtonContainer>

        {!fungibleToken ? (
          <>
            <ButtonContainer>
              <SmallActionButton
                src={ArrowDown}
                text="Receive"
                onPress={() => {
                  if (isReceivingAddressesVisible) {
                    navigate(`/receive/${coin}`);
                  } else {
                    handleReceiveModalOpen();
                  }
                }}
              />
            </ButtonContainer>
            <SmallActionButton src={Buy} text="Buy" onPress={() => navigate(`/buy/${coin}`)} />
          </>
        ) : (
          <RecieveButtonContainer>
            <SmallActionButton
              src={ArrowDown}
              text="Receive"
              onPress={() => navigate(coin === 'brc20' ? '/receive/ORD' : `/receive/${coin}`)}
            />
          </RecieveButtonContainer>
        )}
      </RowButtonContainer>

      <BottomModal
        visible={openReceiveModal}
        header={t('RECEIVE')}
        onClose={handleReceiveModalClose}
      >
        {verifyOrViewAddresses}
      </BottomModal>
    </Container>
  );
}
