import ConnectLedger from '@assets/img/dashboard/connect_ledger.svg';
import Plus from '@assets/img/dashboard/plus.svg';
import AccountRow from '@components/accountRow';
import Separator from '@components/separator';
import TopRow from '@components/topRow';
import { broadcastResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import type { Account } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

export const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const ButtonContainer = styled.button((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  background: 'transparent',
  paddingTop: props.theme.spacing(4),
  paddingBottom: props.theme.spacing(4),
  paddingLeft: props.theme.spacing(11),
  paddingRight: props.theme.spacing(11),
  transition: 'background-color 0.2s ease',
  ':hover': {
    backgroundColor: props.theme.colors.elevation1,
  },
}));

const AccountContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(11),
  paddingRight: props.theme.spacing(11),
  paddingTop: props.theme.spacing(8),
  gap: props.theme.spacing(8),
}));

const AddAccountContainer = styled.div((props) => ({
  display: 'flex',
  height: 40,
  width: 40,
  borderRadius: 25,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: props.theme.colors.elevation1,
  marginRight: props.theme.spacing(8),
}));

const ButtonImage = styled.img({
  alignSelf: 'center',
  transform: 'all',
});

const AddAccountText = styled.h1((props) => ({
  ...props.theme.body_m,
  opacity: 0.8,
  color: props.theme.colors.white_0,
}));

const ButtonsWrapper = styled.div(
  (props) => `
  position: sticky;
  bottom: 0;
  background-color: ${props.theme.colors.elevation0};
  margin-top: ${props.theme.spacing(8)}px;
  margin-bottom: ${props.theme.spacing(11)}px;
`,
);

function AccountList(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'ACCOUNT_SCREEN' });
  const navigate = useNavigate();
  const { network, accountsList, selectedAccount, ledgerAccountsList } = useWalletSelector();
  const { createAccount, switchAccount } = useWalletReducer();

  const displayedAccountsList = useMemo(() => {
    const networkLedgerAccounts = ledgerAccountsList.filter(
      (account) =>
        (account.ordinalsAddress?.startsWith('bc1') && network.type === 'Mainnet') ||
        (account.ordinalsAddress?.startsWith('tb1') && network.type === 'Testnet'),
    );
    return [...networkLedgerAccounts, ...accountsList];
  }, [accountsList, ledgerAccountsList, network]);

  const handleAccountSelect = async (account: Account, goBack = true) => {
    await switchAccount(account);
    broadcastResetUserFlow();
    if (goBack) {
      navigate(-1);
    }
  };

  const isAccountSelected = (account: Account) =>
    account.btcAddress === selectedAccount?.btcAddress &&
    account.stxAddress === selectedAccount?.stxAddress;

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const onCreateAccount = async () => {
    await createAccount();
  };

  const onImportLedgerAccount = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL('options.html#/import-ledger'),
    });
  };

  return (
    <Container>
      <TopRow title={t('CHANGE_ACCOUNT')} onClick={handleBackButtonClick} />
      <AccountContainer>
        {displayedAccountsList.map((account) => (
          <div key={account.btcAddress}>
            <AccountRow
              account={account}
              isSelected={isAccountSelected(account)}
              onAccountSelected={handleAccountSelect}
              isAccountListView
            />
            <Separator />
          </div>
        ))}
      </AccountContainer>
      <ButtonsWrapper>
        <ButtonContainer onClick={onCreateAccount}>
          <AddAccountContainer>
            <ButtonImage src={Plus} />
          </AddAccountContainer>
          <AddAccountText>{t('NEW_ACCOUNT')}</AddAccountText>
        </ButtonContainer>
        <ButtonContainer onClick={onImportLedgerAccount}>
          <AddAccountContainer>
            <ButtonImage src={ConnectLedger} />
          </AddAccountContainer>
          <AddAccountText>{t('LEDGER_ACCOUNT')}</AddAccountText>
        </ButtonContainer>
      </ButtonsWrapper>
    </Container>
  );
}

export default AccountList;
