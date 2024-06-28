import linkIcon from '@assets/img/linkIcon.svg';
import CopyButton from '@components/copyButton';
import OptionsDialog from '@components/optionsDialog/optionsDialog';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useVisibleBrc20FungibleTokens } from '@hooks/queries/ordinals/useGetBrc20FungibleTokens';
import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useSpamTokens from '@hooks/queries/useSpamTokens';
import useResetUserFlow, { broadcastResetUserFlow } from '@hooks/useResetUserFlow';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import { Flag } from '@phosphor-icons/react';
import { FungibleToken } from '@secretkeylabs/xverse-core';
import {
  setBrc20ManageTokensAction,
  setRunesManageTokensAction,
  setSip10ManageTokensAction,
  setSpamTokenAction,
} from '@stores/wallet/actions/actionCreators';
import { StyledP } from '@ui-library/common.styled';
import { CurrencyTypes, SPAM_OPTIONS_WIDTH } from '@utils/constants';
import { getExplorerUrl } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import Theme from 'theme';
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

const ButtonRow = styled.button`
  display: flex;
  align-items: center;
  background-color: transparent;
  flex-direction: row;
  padding-left: ${(props) => props.theme.space.m};
  padding-right: ${(props) => props.theme.space.m};
  padding-top: ${(props) => props.theme.space.s};
  padding-bottom: ${(props) => props.theme.space.s};
  transition: background-color 0.2s ease;
  :hover {
    background-color: ${(props) => props.theme.colors.elevation3};
  }
  :active {
    background-color: ${(props) => props.theme.colors.elevation3};
  }
`;

const TokenText = styled(StyledP)`
  margin-left: ${(props) => props.theme.space.m};
`;

export default function CoinDashboard() {
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const [showFtContractDetails, setShowFtContractDetails] = useState(false);
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const [optionsDialogIndents, setOptionsDialogIndents] = useState<
    { top: string; left: string } | undefined
  >();
  const [searchParams] = useSearchParams();
  const { addToSpamTokens } = useSpamTokens();
  const dispatch = useDispatch();
  const { currency } = useParams();
  const { visible: runesCoinsList } = useVisibleRuneFungibleTokens();
  const { visible: sip10CoinsList } = useVisibleSip10FungibleTokens();
  const { visible: brc20CoinsList } = useVisibleBrc20FungibleTokens();

  const ftKey = searchParams.get('ftKey');
  const protocol = searchParams.get('protocol');
  let selectedFt: FungibleToken | undefined;

  if (ftKey && protocol) {
    switch (protocol) {
      case 'stacks':
        selectedFt = sip10CoinsList.find((ft) => ft.principal === ftKey);
        break;
      case 'brc-20':
        selectedFt = brc20CoinsList.find((ft) => ft.principal === ftKey);
        break;
      case 'runes':
        selectedFt = runesCoinsList.find((ft) => ft.principal === ftKey);
        break;
      default:
        selectedFt = undefined;
    }
  }

  useResetUserFlow('/coinDashboard');
  useBtcWalletData();

  const handleGoBack = () => broadcastResetUserFlow();

  useTrackMixPanelPageViewed(
    protocol
      ? {
          protocol,
        }
      : {},
  );

  const openOptionsDialog = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShowOptionsDialog(true);

    setOptionsDialogIndents({
      top: `${(event.target as HTMLElement).parentElement?.getBoundingClientRect().top}px`,
      left: `calc(100% - ${SPAM_OPTIONS_WIDTH}px)`,
    });
  };

  const closeOptionsDialog = () => {
    setShowOptionsDialog(false);
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
      <TopRow
        onClick={handleGoBack}
        onMenuClick={currency !== 'STX' && currency !== 'BTC' ? openOptionsDialog : undefined}
      />
      {showOptionsDialog && (
        <OptionsDialog
          closeDialog={closeOptionsDialog}
          optionsDialogIndents={optionsDialogIndents}
          width={SPAM_OPTIONS_WIDTH}
        >
          <ButtonRow
            onClick={() => {
              if (!selectedFt) {
                handleGoBack();
                return;
              }
              // set the visibility to false
              const payload = {
                principal: selectedFt.principal,
                isEnabled: false,
              };
              if (protocol === 'runes') {
                dispatch(setRunesManageTokensAction(payload));
              } else if (protocol === 'stacks') {
                dispatch(setSip10ManageTokensAction(payload));
              } else if (protocol === 'brc-20') {
                dispatch(setBrc20ManageTokensAction(payload));
              }

              addToSpamTokens(selectedFt.principal);
              dispatch(setSpamTokenAction(selectedFt));

              handleGoBack();
            }}
          >
            <Flag size={24} color={Theme.colors.danger_light} />
            <TokenText color="danger_light" typography="body_medium_l">
              {t('HIDE_AND_REPORT')}
            </TokenText>
          </ButtonRow>
        </OptionsDialog>
      )}
      <Container>
        <CoinHeader currency={currency as CurrencyTypes} fungibleToken={selectedFt} />
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
              data-testid="coin-contract-button"
              disabled={showFtContractDetails}
              onClick={onContractClick}
              isSelected={showFtContractDetails}
            >
              {t('CONTRACT')}
            </Button>
          </FtInfoContainer>
        )}
        {selectedFt && protocol === 'stacks' && showFtContractDetails && (
          <TokenContractContainer data-testid="coin-contract-container">
            <h1>{t('FT_CONTRACT_PREFIX')}</h1>
            <ContractAddressCopyButton onClick={handleCopyContractAddress}>
              <TokenContractAddress data-testid="coin-contract-address">
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
        <TransactionsHistoryList
          coin={currency as CurrencyTypes}
          stxTxFilter={
            selectedFt?.protocol === 'runes'
              ? selectedFt?.name
              : `${selectedFt?.principal}::${selectedFt?.assetName}`
          }
          brc20Token={protocol === 'brc-20' ? selectedFt?.principal || null : null}
          runeToken={protocol === 'runes' ? selectedFt?.name || null : null}
          runeSymbol={protocol === 'runes' ? selectedFt?.runeSymbol || null : null}
        />
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}
