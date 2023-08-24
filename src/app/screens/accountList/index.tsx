import AccountRow from '@components/accountRow';
import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Plus from '@assets/img/dashboard/plus.svg';
import ConnectLedger from '@assets/img/dashboard/connect_ledger.svg';
import { useDispatch } from 'react-redux';
import { selectAccount } from '@stores/wallet/actions/actionCreators';
import Separator from '@components/separator';
import { Account } from '@secretkeylabs/xverse-core/types';
import useWalletSelector from '@hooks/useWalletSelector';
import useWalletReducer from '@hooks/useWalletReducer';
import React, { useEffect, useMemo } from 'react';
import { useResetUserFlow } from '@hooks/useResetUserFlow';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

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
    backgroundColor: props.theme.colors.background.elevation1,
  },
}));

const AccountContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(11),
  paddingRight: props.theme.spacing(11),
}));

const AddAccountContainer = styled.div((props) => ({
  display: 'flex',
  height: 40,
  width: 40,
  borderRadius: 25,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: props.theme.colors.background.elevation1,
  marginRight: props.theme.spacing(8),
}));

const ButtonImage = styled.img({
  alignSelf: 'center',
  transform: 'all',
});

const AddAccountText = styled.h1((props) => ({
  ...props.theme.body_m,
  opacity: 0.8,
  color: props.theme.colors.white['0'],
}));

const ButtonsWrapper = styled.div(
  (props) => `
  position: sticky;
  bottom: 0;
  background-color: ${props.theme.colors.background.elevation0};
  margin-top: ${props.theme.spacing(8)}px;
  margin-bottom: ${props.theme.spacing(11)}px;
`,
);

function AccountList(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'ACCOUNT_SCREEN' });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { network, accountsList, selectedAccount, ledgerAccountsList } = useWalletSelector();
  const { createAccount } = useWalletReducer();

  const displayedAccountsList = useMemo(() => {
    if (network.type === 'Mainnet') {
      return [...ledgerAccountsList, ...accountsList];
    }
    return accountsList;
  }, [accountsList, ledgerAccountsList, network]);

  const { broadcastResetUserFlow, closeChannel } = useResetUserFlow();
  // destructor
  useEffect(() => closeChannel, []);

  const handleAccountSelect = (account: Account) => {
    dispatch(
      selectAccount(
        account,
        account.stxAddress,
        account.btcAddress,
        account.ordinalsAddress,
        account.masterPubKey,
        account.stxPublicKey,
        account.btcPublicKey,
        account.ordinalsPublicKey,
        network,
        undefined,
        account.accountType,
        account.accountName,
      ),
    );
    broadcastResetUserFlow();
    navigate('/');
  };

  const isAccountSelected = (account: Account) =>
    account.btcAddress === selectedAccount?.btcAddress &&
    account.stxAddress === selectedAccount?.stxAddress;

  const handleBackButtonClick = () => {
    navigate('/');
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
          <React.Fragment key={account.btcAddress}>
            <AccountRow
              account={account}
              isSelected={isAccountSelected(account)}
              onAccountSelected={handleAccountSelect}
              isAccountListView
            />
            <Separator />
          </React.Fragment>
        ))}
      </AccountContainer>
      <ButtonsWrapper>
        <ButtonContainer onClick={onCreateAccount}>
          <AddAccountContainer>
            <ButtonImage src={Plus} />
          </AddAccountContainer>
          <AddAccountText>{t('NEW_ACCOUNT')}</AddAccountText>
        </ButtonContainer>
        {network.type === 'Mainnet' && (
          <ButtonContainer onClick={onImportLedgerAccount}>
            <AddAccountContainer>
              <ButtonImage src={ConnectLedger} />
            </AddAccountContainer>
            <AddAccountText>{t('LEDGER_ACCOUNT')}</AddAccountText>
          </ButtonContainer>
        )}
      </ButtonsWrapper>
    </Container>
  );
}

export default AccountList;
