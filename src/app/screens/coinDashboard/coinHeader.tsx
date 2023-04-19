import ActionButton from '@components/button';
import TokenImage from '@components/tokenImage';
import { animated, config, useSpring } from '@react-spring/web';
import CreditCard from '@assets/img/dashboard/credit_card.svg';
import ArrowDownLeft from '@assets/img/dashboard/arrow_down_left.svg';
import ArrowUpRight from '@assets/img/dashboard/arrow_up_right.svg';
import Lock from '@assets/img/transactions/Lock.svg';
import PlusIcon from '@assets/img/transactions/Plus.svg';
import MinusIcon from '@assets/img/transactions/Minus.svg';
import CopyIcon from '@assets/img/transactions/Copy.svg';
import linkIcon from '@assets/img/linkIcon.svg';
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
import { useState } from 'react';
import { getExplorerUrl } from '@utils/helper';

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

const BalanceInfoContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const BalanceValuesContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(12),
}));

const CoinBalanceText = styled.h1((props) => ({
  ...props.theme.headline_l,
  fontSize: 24,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const FiatAmountText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  fontSize: 14,
  marginTop: props.theme.spacing(2),
  textAlign: 'center',
}));

const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: props.theme.spacing(11),
}));

const ButtonContainer = styled.div((props) => ({
  flex: 1,
  marginRight: props.theme.spacing(3),
}));

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

const ShowMoreButton = styled.button((props) => ({
  ...props.theme.body_xs,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(8),
  alignSelf: 'center',
  width: 144,
  background: 'none',
  color: props.theme.colors.white[0],
  border: `1px solid ${props.theme.colors.background.elevation3}`,
  height: 34,
  borderRadius: props.theme.radius(3),
  img: {
    marginLeft: props.theme.spacing(3),
  },
}));

const TokenContractContainer = styled(animated.div)((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(8),
  h1: {
    ...props.theme.headline_category_s,
    color: props.theme.colors.white[400],
    textTransform: 'uppercase',
  },
}));

const ContractAddressCopyButton = styled.button((props) => ({
  display: 'flex',
  marginTop: props.theme.spacing(2),
  background: 'none',
  justifyContent: 'space-between',
}));

const TokenContractAddress = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[0],
  textAlign: 'left',
  marginRight: props.theme.spacing(1.5),
}));

const StacksLockedInfoText = styled.span((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[400],
  textAlign: 'left',
}));

const ContractDeploymentButton = styled.button((props) => ({
  ...props.theme.body_m,
  display: 'flex',
  alignItems: 'center',
  marginTop: props.theme.spacing(8),
  background: 'none',
  color: props.theme.colors.white[400],
  span: {
    color: props.theme.colors.white[0],
    marginLeft: props.theme.spacing(3),
  },
  img: {
    marginLeft: props.theme.spacing(3),
  },
}));

const CopyImage = styled.img({
  width: 23,
  height: 23,
  border: 1.5,
});

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
    isLedgerAccount,
  } = useWalletSelector();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const [ftInfoShown, setInfoShown] = useState<boolean>(false);
  const slideInStyles = useSpring({
    config: { ...config.stiff },
    from: { opacity: 0, height: 0 },
    to: {
      opacity: ftInfoShown ? 1 : 0,
      height: ftInfoShown ? 80 : 0,
    },
  });

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

  const openContractDeployment = () => {
    window.open(getExplorerUrl(fungibleToken?.principal as string), '_blank');
  };

  const handleCopyContractAddress = () => {
    navigator.clipboard.writeText(fungibleToken?.principal as string);
  };

  function formatAddress(addr: string): string {
    return addr
      ? `${addr.substring(0, 20)}...${addr.substring(addr.length - 20, addr.length)}`
      : '';
  }

  const renderFtInfo = () => (
    <>
      <ShowMoreButton onClick={() => setInfoShown(!ftInfoShown)}>
        {ftInfoShown ? t('LESS_FT_INFO_BUTTON') : t('SHOW_FT_INFO_BUTTON')}
        <img src={ftInfoShown ? MinusIcon : PlusIcon} alt="show" />
      </ShowMoreButton>
      {ftInfoShown ? (
        <TokenContractContainer style={slideInStyles}>
          <h1>{t('FT_CONTRACT_PREFIX')}</h1>
          <ContractAddressCopyButton onClick={handleCopyContractAddress}>
            <TokenContractAddress>
              {formatAddress(fungibleToken?.principal as string)}
            </TokenContractAddress>
            <CopyImage src={CopyIcon} />
          </ContractAddressCopyButton>
          <ContractDeploymentButton onClick={openContractDeployment}>
            {t('OPEN_FT_CONTRACT_DEPLOYMENT')}
            <span>{t('STACKS_EXPLORER')}</span>
            <img src={linkIcon} alt="link" />
          </ContractDeploymentButton>
        </TokenContractContainer>
      ) : null}
    </>
  );

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
    if (isLedgerAccount) {
      if (coin === 'BTC') {
        await chrome.tabs.create({
          url: chrome.runtime.getURL('options.html#/send-btc-ledger'),
        });
        return;
      }
      if (coin === 'STX') {
        await chrome.tabs.create({
          url: chrome.runtime.getURL('options.html#/send-stx-ledger'),
        });
        return;
      }
    }
    if (coin === 'STX' || coin === 'BTC') {
      navigate(`/send-${coin}`);
    } else {
      navigate('/send-ft', {
        state: {
          fungibleToken,
        },
      });
    }
  };

  return (
    <Container>
      <BalanceInfoContainer>
        <TokenImage
          token={coin || undefined}
          loading={false}
          fungibleToken={fungibleToken || undefined}
        />
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
      {fungibleToken ? renderFtInfo() : null}
      {renderStackingBalances()}
      <RowButtonContainer>
        <ButtonContainer>
          <ActionButton src={ArrowUpRight} text="Send" onPress={() => goToSendScreen()} />
        </ButtonContainer>
        <ButtonContainer>
          <ActionButton
            src={ArrowDownLeft}
            text="Receive"
            onPress={() => navigate(`/receive/${coin}`)}
          />
        </ButtonContainer>
        {!fungibleToken && (
          <ButtonContainer>
            <ActionButton src={CreditCard} text="Buy" onPress={() => navigate(`/buy/${coin}`)} />
          </ButtonContainer>
        )}
      </RowButtonContainer>
    </Container>
  );
}
