import ConnectLedger from '@assets/img/dashboard/connect_ledger.svg';
import { filterLedgerAccounts } from '@common/utils/ledger';
import LazyAccountRow from '@components/accountRow/lazyAccountRow';
import ActionButton from '@components/button';
import Separator from '@components/separator';
import TopRow from '@components/topRow';
import useAccountBalance from '@hooks/queries/useAccountBalance';
import { broadcastResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { Plus } from '@phosphor-icons/react';
import { Account } from '@secretkeylabs/xverse-core';
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
  paddingLeft: props.theme.spacing(11),
  paddingRight: props.theme.spacing(11),
  paddingTop: props.theme.spacing(8),
  gap: props.theme.spacing(8),
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
  const { network, accountsList, ledgerAccountsList } = useWalletSelector();
  const { createAccount, switchAccount } = useWalletReducer();
  const { enqueueFetchBalances } = useAccountBalance();

  const hideListActions = Boolean(params.get('hideListActions')) || false;

  const displayedAccountsList = useMemo(() => {
    const networkLedgerAccounts = filterLedgerAccounts(ledgerAccountsList, network.type);
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
            <ActionButton
              icon={<Plus size={16} fill="white" />}
              onPress={onCreateAccount}
              text={t('NEW_ACCOUNT')}
              transparent
            />
            <ActionButton
              icon={<img src={ConnectLedger} width={16} height={16} alt="" />}
              onPress={onImportLedgerAccount}
              text={t('LEDGER_ACCOUNT')}
              transparent
            />
          </ButtonsWrapper>
        ) : null}
      </Container>
    </>
  );
}

export default AccountList;
