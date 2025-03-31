import connectHwIcon from '@assets/img/hw/connect_hw.svg';
import { filterKeystoneAccountsByNetwork } from '@common/utils/keystone';
import { filterLedgerAccountsByNetwork } from '@common/utils/ledger';
import LazyAccountRow from '@components/accountRow/lazyAccountRow';
import Separator from '@components/separator';
import TopRow from '@components/topRow';
import useAccountBalance from '@hooks/queries/useAccountBalance';
import { broadcastResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useVault from '@hooks/useVault';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { Plus } from '@phosphor-icons/react';
import type { Account } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  flex: 1,
  overflowY: 'auto',
  borderRadius: 'inherit',
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
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
`,
);

const Title = styled.div((props) => ({
  ...props.theme.typography.headline_xs,
  marginBottom: props.theme.space.m,
}));

function AccountList(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'ACCOUNT_SCREEN' });
  const navigate = useNavigate();
  const { search, state } = useLocation();
  const params = new URLSearchParams(search);
  const selectedAccount = useSelectedAccount();
  const { network, softwareWallets, ledgerAccountsList, keystoneAccountsList, addingAccount } =
    useWalletSelector();
  const { createSoftwareAccount, switchAccount } = useWalletReducer();
  const { enqueueFetchBalances } = useAccountBalance();
  const vault = useVault();

  const hideListActions = Boolean(params.get('hideListActions')) || false;

  const displayedAccountsList = useMemo(() => {
    const networkLedgerAccounts = filterLedgerAccountsByNetwork(ledgerAccountsList, network.type);
    const networkKeystoneAccounts = filterKeystoneAccountsByNetwork(
      keystoneAccountsList,
      network.type,
    );
    const softwareAccounts = softwareWallets[network.type].map((wallet) => wallet.accounts).flat();
    return [...networkLedgerAccounts, ...networkKeystoneAccounts, ...softwareAccounts];
  }, [softwareWallets, ledgerAccountsList, keystoneAccountsList, network]);

  const handleBackButtonClick = () => {
    navigate(state?.from || -1);
  };

  const handleAccountSelect = async (account: Account, goBack = true) => {
    await switchAccount(account);
    broadcastResetUserFlow();
    if (goBack) {
      handleBackButtonClick();
    }
  };

  const isAccountSelected = (account: Account) =>
    account.btcAddresses.taproot.address === selectedAccount.ordinalsAddress &&
    account.stxAddress === selectedAccount.stxAddress;

  const onCreateAccount = async () => {
    // TODO multiwallet: with multi wallet, walletId needs to be set by the user on click
    const walletIds = await vault.SeedVault.getWalletIds();
    await createSoftwareAccount(walletIds[0]);
  };

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <div>
          <AccountContainer>
            <Title>{t('TITLE')}</Title>
            {displayedAccountsList.map((account) => (
              <div
                key={`${account.accountType}:${account.masterPubKey}:${account.id}:${account.deviceAccountIndex}`}
              >
                <LazyAccountRow
                  walletId={account.walletId}
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
              loading={addingAccount}
              disabled={addingAccount}
            />
            <Button
              icon={
                <img src={connectHwIcon} width={16} height={16} alt="hardware wallet connection" />
              }
              onClick={() => navigate('/connect-hardware-wallet')}
              title={t('NEW_HARDWARE_WALLET')}
              variant="secondary"
              disabled={addingAccount}
            />
          </ButtonsWrapper>
        ) : null}
      </Container>
    </>
  );
}

export default AccountList;
