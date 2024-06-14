import linkIcon from '@assets/img/linkIcon.svg';
import CopyButton from '@components/copyButton';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useVisibleBrc20FungibleTokens } from '@hooks/queries/ordinals/useGetBrc20FungibleTokens';
import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useGetRuneFungibleTokens';
import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import { CurrencyTypes } from '@utils/constants';
import { getExplorerUrl } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import CoinHeader from './coinHeader';
import LockedBtcList from './lockedBtcList';
import TransactionsHistoryList from './transactionsHistoryList';

const Container = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  marginTop: props.theme.spacing(4),
  flexDirection: 'column',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

const TokenContractContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginTop: props.theme.spacing(16),
  h1: {
    ...props.theme.typography.body_medium_m,
    color: props.theme.colors.white_400,
  },
}));

const ContractAddressCopyButton = styled.button((props) => ({
  display: 'flex',
  marginTop: props.theme.spacing(2),
  background: 'transparent',
}));

const TokenContractAddress = styled.p((props) => ({
  ...props.theme.typography.body_medium_l,
  color: props.theme.colors.white_0,
  textAlign: 'left',
  overflowWrap: 'break-word',
  width: 300,
}));

const FtInfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  borderTop: `1px solid ${props.theme.colors.elevation2}`,
  paddingTop: props.theme.spacing(12),
  marginTop: props.theme.spacing(16),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(14),
}));

const ShareIcon = styled.img({
  width: 18,
  height: 18,
});

const CopyButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(2),
}));

const ContractDeploymentButton = styled.button((props) => ({
  ...props.theme.typography.body_m,
  display: 'flex',
  alignItems: 'center',
  marginTop: props.theme.spacing(12),
  background: 'none',
  color: props.theme.colors.white_400,
  span: {
    color: props.theme.colors.white_0,
    marginLeft: props.theme.spacing(3),
  },
  img: {
    marginLeft: props.theme.spacing(3),
  },
}));

const Button = styled.button<{
  isSelected: boolean;
}>((props) => ({
  ...props.theme.typography.body_bold_l,
  fontSize: 11,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 31,
  paddingLeft: props.theme.spacing(6),
  paddingRight: props.theme.spacing(6),
  marginRight: props.theme.spacing(2),
  borderRadius: 44,
  background: props.isSelected ? props.theme.colors.elevation2 : 'transparent',
  color: props.theme.colors.white_0,
  opacity: props.isSelected ? 1 : 0.6,
}));

export default function CoinDashboard() {
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const navigate = useNavigate();
  const [showFtContractDetails, setShowFtContractDetails] = useState(false);
  const { currency } = useParams();
  const [searchParams] = useSearchParams();
  const { visible: runesCoinsList } = useVisibleRuneFungibleTokens();
  const { visible: sip10CoinsList } = useVisibleSip10FungibleTokens();
  const { visible: brc20CoinsList } = useVisibleBrc20FungibleTokens();
  const ftKey = searchParams.get('ftKey');

  const selectedFt =
    sip10CoinsList.find((ft) => ft.principal === ftKey) ??
    brc20CoinsList.find((ft) => ft.principal === ftKey) ??
    runesCoinsList.find((ft) => ft.principal === ftKey);

  const protocol = selectedFt?.protocol;

  useBtcWalletData();
  useTrackMixPanelPageViewed(
    protocol
      ? {
          protocol,
        }
      : {},
  );

  const handleBack = () => {
    navigate(-1);
  };

  const openContractDeployment = () =>
    window.open(getExplorerUrl(selectedFt?.principal as string), '_blank');

  const onContractClick = () => setShowFtContractDetails(true);

  const handleCopyContractAddress = () =>
    navigator.clipboard.writeText(selectedFt?.principal as string);

  const onTransactionsClick = () => setShowFtContractDetails(false);

  const formatAddress = (addr: string): string =>
    addr ? `${addr.substring(0, 20)}...${addr.substring(addr.length - 20, addr.length)}` : '';

  return (
    <>
      <TopRow onClick={handleBack} />
      <Container>
        <CoinHeader coin={currency as CurrencyTypes} fungibleToken={selectedFt} />
        {protocol === 'stacks' && (
          <FtInfoContainer>
            <Button
              disabled={!showFtContractDetails}
              isSelected={!showFtContractDetails}
              onClick={onTransactionsClick}
            >
              {t('TRANSACTIONS')}
            </Button>
            <Button
              disabled={showFtContractDetails}
              onClick={onContractClick}
              isSelected={showFtContractDetails}
            >
              {t('CONTRACT')}
            </Button>
          </FtInfoContainer>
        )}
        {protocol === 'stacks' && showFtContractDetails && (
          <TokenContractContainer>
            <h1>{t('FT_CONTRACT_PREFIX')}</h1>
            <ContractAddressCopyButton onClick={handleCopyContractAddress}>
              <TokenContractAddress>
                {formatAddress(selectedFt?.principal as string)}
              </TokenContractAddress>
              <CopyButtonContainer>
                <CopyButton text={selectedFt?.principal as string} />
              </CopyButtonContainer>
            </ContractAddressCopyButton>
            <ContractDeploymentButton onClick={openContractDeployment}>
              {t('OPEN_FT_CONTRACT_DEPLOYMENT')}
              <span>{t('STACKS_EXPLORER')}</span>
              <ShareIcon src={linkIcon} alt="link" />
            </ContractDeploymentButton>
          </TokenContractContainer>
        )}
        {protocol !== 'runes' && currency !== 'Locked-BTC' && (
          <TransactionsHistoryList
            coin={currency as CurrencyTypes}
            txFilter={`${selectedFt?.principal}::${selectedFt?.assetName}`}
            brc20Token={protocol === 'brc-20' ? selectedFt?.principal || null : null}
          />
        )}
        {currency === 'Locked-BTC' && <LockedBtcList />}
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}
