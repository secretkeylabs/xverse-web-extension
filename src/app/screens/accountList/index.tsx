import AccountRow from '@components/accountRow';
import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Plus from '@assets/img/dashboard/plus.svg';
import { useDispatch } from 'react-redux';
import { selectAccount } from '@stores/wallet/actions/actionCreators';
import Seperator from '@components/seperator';
import { Account } from '@secretkeylabs/xverse-core/types';
import useWalletSelector from '@hooks/useWalletSelector';
import useWalletReducer from '@hooks/useWalletReducer';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const RowContainer = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  background: 'transparent',
  marginTop: props.theme.spacing(8),
}));

const AccountContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(11),
  paddingRight: props.theme.spacing(11),
  marginBottom: props.theme.spacing(11),
}));

const AddAccountContainer = styled.div((props) => ({
  display: 'flex',
  height: 48,
  width: 48,
  borderRadius: props.theme.radius(5),
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

function AccountList(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'ACCOUNT_SCREEN' });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    network, accountsList, selectedAccount,
  } = useWalletSelector();
  const { createAccount } = useWalletReducer();

  const handleAccountSelect = (account: Account) => {
    dispatch(
      selectAccount(
        account,
        account.stxAddress,
        account.btcAddress,
        account.masterPubKey,
        account.stxPublicKey,
        account.btcPublicKey,
        network,
      ),
    );
    navigate(-1);
  };

  const isAccountSelected = (account: Account) => account.id === selectedAccount?.id;

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  async function onCreateAccount() {
    await createAccount();
  }

  return (
    <Container>
      <TopRow title={t('CHANGE_ACCOUNT')} onClick={handleBackButtonClick} />
      <AccountContainer>
        {accountsList.map((account) => (
          <>
            <AccountRow
              key={account.stxAddress}
              account={account}
              isSelected={isAccountSelected(account)}
              onAccountSelected={handleAccountSelect}
            />
            <Seperator />
          </>
        ))}
        <RowContainer onClick={async () => onCreateAccount()}>
          <AddAccountContainer>
            <ButtonImage src={Plus} />
          </AddAccountContainer>
          <AddAccountText>{t('NEW_ACCOUNT')}</AddAccountText>
        </RowContainer>
      </AccountContainer>
    </Container>
  );
}

export default AccountList;
