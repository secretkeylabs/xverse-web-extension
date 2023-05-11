import TopRow from '@components/topRow';
import BottomBar from '@components/tabBar';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useWalletSelector from '@hooks/useWalletSelector';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import styled from 'styled-components';
import { CurrencyTypes } from '@utils/constants';
import { useState } from 'react';
import linkIcon from '@assets/img/linkIcon.svg';
import { useTranslation } from 'react-i18next';
import { getExplorerUrl } from '@utils/helper';
import CopyButton from '@components/copyButton';
import { FungibleToken } from '@secretkeylabs/xverse-core';
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
  paddingLeft: 16,
  paddingRight: 16,
  marginTop: props.theme.spacing(16),
  h1: {
    ...props.theme.body_medium_m,
    color: props.theme.colors.white[400],
  },
}));

const TransactionHistoryContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  paddingLeft: 16,
  paddingRight: 16,
  marginTop: props.theme.spacing(30),
  borderTop: `1px solid ${props.theme.colors.background.elevation2}`,
  h1: {
    ...props.theme.headline_s,
    color: props.theme.colors.white[0],
    marginTop: 32,
  },
  h2: {
    ...props.theme.body_m,
    fontStyle: 'italic',
    color: props.theme.colors.white[200],
    marginTop: 16,
  },
}));

const ContractAddressCopyButton = styled.button((props) => ({
  display: 'flex',
  marginTop: props.theme.spacing(2),
  background: 'none',
  justifyContent: 'space-between',
}));

const TokenContractAddress = styled.p((props) => ({
  ...props.theme.body_medium_l,
  color: props.theme.colors.white[0],
  textAlign: 'left',
  marginRight: props.theme.spacing(1),
}));

const FtInfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  borderTop: `1px solid ${props.theme.colors.background.elevation2}`,
  paddingTop: props.theme.spacing(12),
  marginTop: props.theme.spacing(16),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(14),
}));

const ShareIcon = styled.img({
  width: 18,
  height: 18,
});

const ContractDeploymentButton = styled.button((props) => ({
  ...props.theme.body_m,
  display: 'flex',
  alignItems: 'center',
  marginTop: props.theme.spacing(12),
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

interface ButtonProps {
  isSelected: boolean;
}
const Button = styled.button<ButtonProps>((props) => ({
  ...props.theme.body_bold_l,
  fontSize: 11,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 31,
  paddingLeft: 12,
  paddingRight: 12,
  borderRadius: 44,
  background: props.isSelected ? props.theme.colors.background.elevation2 : 'transparent',
  color: props.theme.colors.white[0],
  opacity: props.isSelected ? 1 : 0.6,
  marginRight: 4,
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
  let brc20Ft : FungibleToken | undefined;
  if (brc20FtName) {
    brc20Ft = brcCoinsList?.find((brc20FtCoin) => brc20FtCoin.name === brc20FtName);
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

  function formatAddress(addr: string): string {
    return addr ? `${addr.substring(0, 20)}...${addr.substring(addr.length - 20, addr.length)}` : '';
  }
  const showContent = () => {
    if (ft) {
      if (showFtContractDetails) {
        return (
          <TokenContractContainer>
            <h1>{t('FT_CONTRACT_PREFIX')}</h1>
            <ContractAddressCopyButton onClick={handleCopyContractAddress}>
              <TokenContractAddress>
                {formatAddress(ft?.principal as string)}
              </TokenContractAddress>
              <CopyButton text={ft?.principal as string} />
            </ContractAddressCopyButton>
            <ContractDeploymentButton onClick={openContractDeployment}>
              {t('OPEN_FT_CONTRACT_DEPLOYMENT')}
              <span>{t('STACKS_EXPLORER')}</span>
              <ShareIcon src={linkIcon} alt="link" />
            </ContractDeploymentButton>
          </TokenContractContainer>
        );
      }
    } else if (brc20FtName) {
      return (
        <TransactionHistoryContainer>
          <h1>{t('TRANSACTION_HISTORY_TITLE')}</h1>
          <h2>{`${t('COMING_SOON')}!`}</h2>
        </TransactionHistoryContainer>
      );
    }
    return <TransactionsHistoryList coin={coin as CurrencyTypes} txFilter={`${ft?.principal}::${ft?.assetName}`} />;
  };

  return (
    <>
      <TopRow title="" onClick={handleBack} />
      <Container>
        <CoinHeader isBRC20Token={!!brc20FtName} coin={coin as CurrencyTypes} fungibleToken={ft || brc20Ft} />
        {ft && (
          <FtInfoContainer>
            <Button isSelected={!showFtContractDetails} onClick={onTransactionsClick}>{t('TRANSACTIONS')}</Button>
            <Button onClick={onContractClick} isSelected={showFtContractDetails}>{t('CONTRACT')}</Button>
          </FtInfoContainer>
        )}
        {showContent()}

      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}
