import linkIcon from '@assets/img/linkIcon.svg';
import CopyButton from '@components/copyButton';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useWalletSelector from '@hooks/useWalletSelector';
import { FungibleToken } from '@secretkeylabs/xverse-core';
import { CurrencyTypes } from '@utils/constants';
import { getExplorerUrl } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import CoinHeader from './coinHeader';
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
  const { coin } = useParams();
  const [searchParams] = useSearchParams();
  const { coinsList, brcCoinsList } = useWalletSelector();
  const ftAddress = searchParams.get('ft');
  const brc20FtName = searchParams.get('brc20ft');

  useBtcWalletData();

  const handleBack = () => {
    navigate(-1);
  };

  const ft = coinsList?.find((ftCoin) => ftCoin.principal === ftAddress);
  let brc20Ft: FungibleToken | undefined;
  if (brc20FtName) {
    brc20Ft = brcCoinsList?.find((brc20FtCoin) => brc20FtCoin.principal === brc20FtName);
  }

  const openContractDeployment = () => {
    window.open(getExplorerUrl(ft?.principal as string), '_blank');
  };

  const onContractClick = () => {
    setShowFtContractDetails(true);
  };

  const handleCopyContractAddress = () => {
    navigator.clipboard.writeText(ft?.principal as string);
  };

  const onTransactionsClick = () => {
    setShowFtContractDetails(false);
  };

  const formatAddress = (addr: string): string =>
    addr ? `${addr.substring(0, 20)}...${addr.substring(addr.length - 20, addr.length)}` : '';

  return (
    <>
      <TopRow onClick={handleBack} />
      <Container>
        <CoinHeader coin={coin as CurrencyTypes} fungibleToken={ft || brc20Ft} />
        {ft && (
          <FtInfoContainer>
            <Button isSelected={!showFtContractDetails} onClick={onTransactionsClick}>
              {t('TRANSACTIONS')}
            </Button>
            <Button onClick={onContractClick} isSelected={showFtContractDetails}>
              {t('CONTRACT')}
            </Button>
          </FtInfoContainer>
        )}
        {ft && showFtContractDetails ? (
          <TokenContractContainer>
            <h1>{t('FT_CONTRACT_PREFIX')}</h1>
            <ContractAddressCopyButton onClick={handleCopyContractAddress}>
              <TokenContractAddress>{formatAddress(ft?.principal as string)}</TokenContractAddress>
              <CopyButtonContainer>
                <CopyButton text={ft?.principal as string} />
              </CopyButtonContainer>
            </ContractAddressCopyButton>
            <ContractDeploymentButton onClick={openContractDeployment}>
              {t('OPEN_FT_CONTRACT_DEPLOYMENT')}
              <span>{t('STACKS_EXPLORER')}</span>
              <ShareIcon src={linkIcon} alt="link" />
            </ContractDeploymentButton>
          </TokenContractContainer>
        ) : (
          <TransactionsHistoryList
            coin={coin as CurrencyTypes}
            txFilter={`${ft?.principal}::${ft?.assetName}`}
            brc20Token={brc20FtName}
          />
        )}
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}
