import ConnectLedger from '@assets/img/dashboard/connect_ledger.svg';
import { filterLedgerAccounts } from '@common/utils/ledger';
import LazyAccountRow from '@components/accountRow/lazyAccountRow';
import Separator from '@components/separator';
import TopRow from '@components/topRow';
import useAccountBalance from '@hooks/queries/useAccountBalance';
import { broadcastResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { Plus } from '@phosphor-icons/react';
import type { Account } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { filterKeystoneAccounts } from '@utils/account';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const AccountContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.m,
  padding: props.theme.space.m,
  paddingBottom: 0,
}));

const ButtonsWrapper = styled.div(
  (props) => `
  display: flex;
  flex-direction: column;
  position: sticky;
  bottom: 0;
  row-gap: ${props.theme.space.s};
  background-color: ${props.theme.colors.elevation0};
  padding: ${props.theme.space.m};
  padding-top: ${props.theme.space.l};
  padding-bottom: ${props.theme.space.xxl};
`,
);

const Title = styled.div((props) => ({
  ...props.theme.typography.headline_xs,
  marginBottom: props.theme.space.m,
}));

function AccountList(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'ACCOUNT_SCREEN' });
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const selectedAccount = useSelectedAccount();
  const { network, accountsList, ledgerAccountsList, keystoneAccountsList } = useWalletSelector();
  const { createAccount, switchAccount } = useWalletReducer();
  const { enqueueFetchBalances } = useAccountBalance();

  const hideListActions = Boolean(params.get('hideListActions')) || false;

  const displayedAccountsList = useMemo(() => {
    const networkLedgerAccounts = filterLedgerAccounts(ledgerAccountsList, network.type);
    const networkKeystoneAccounts = filterKeystoneAccounts(keystoneAccountsList, network.type);
    return [...networkLedgerAccounts, ...networkKeystoneAccounts, ...accountsList];
  }, [accountsList, ledgerAccountsList, keystoneAccountsList, network]);

  console.warn('DEBUGPRINT[11]: index.tsx:70: displayedAccountsList=', displayedAccountsList);

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const handleAccountSelect = async (account: Account, goBack = true) => {
    console.warn('DEBUGPRINT[4]: index.tsx:81: account=', account);
    await switchAccount(account);
    broadcastResetUserFlow();
    if (goBack) {
      handleBackButtonClick();
    }
  };

  const isAccountSelected = (account: Account) =>
    account.btcAddress === selectedAccount?.btcAddress &&
    account.stxAddress === selectedAccount?.stxAddress;

  const onCreateAccount = async () => {
    await createAccount();
  };

  const onImportLedgerAccount = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL('options.html#/import-ledger'),
    });
  };

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <div>
          <AccountContainer>
            <Title>{t('TITLE')}</Title>
            {displayedAccountsList.map((account) => (
              <div key={account.btcAddress}>
                <LazyAccountRow
                  account={account}
                  isSelected={isAccountSelected(account)}
                  onAccountSelected={handleAccountSelect}
                  fetchBalance={enqueueFetchBalances}
                  isAccountListView
                />
                <Separator />
              </div>
            ))}
          </AccountContainer>
        </div>
        {!hideListActions ? (
          <ButtonsWrapper>
            <Button
              icon={<Plus size={16} fill="white" />}
              onClick={onCreateAccount}
              title={t('NEW_ACCOUNT')}
              variant="secondary"
            />
            <Button
              icon={<img src={ConnectLedger} width={16} height={16} alt="" />}
              onClick={onImportLedgerAccount}
              title={t('LEDGER_ACCOUNT')}
              variant="secondary"
            />
          </ButtonsWrapper>
        ) : null}
      </Container>
    </>
  );
}

export default AccountList;
