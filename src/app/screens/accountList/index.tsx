import AccountRow from '@components/accountRow';
import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Plus from '@assets/img/dashboard/plus.svg';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from '@stores/root/reducer';
import { addAccountRequestAction, selectAccount, } from '@stores/wallet/actions/actionCreators';
import { Account } from '@core/types/accounts';
import { saveSelectedAccount } from '@utils/localStorage';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y:auto;
  &::-webkit-scrollbar {
    display: none;
  }
  `
const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(8),
}));

const AccountContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(11),
  paddingRight: props.theme.spacing(11),
  marginBottom: props.theme.spacing(11),
}));

const Seperator = styled.div((props) => ({
  width: '100%',
  height: 0,
  border: `0.2px solid ${props.theme.colors.background.elevation2}`,
  marginTop: props.theme.spacing(8),
}));

const AddAccountContainer = styled.button((props) => ({
  display: 'flex',
  height: 48,
  width: 48,
  borderRadius: props.theme.radius(5),
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: props.theme.colors.background.elevation1,
  marginRight: props.theme.spacing(8),
}));

const ButtonImage = styled.img((props) => ({
  alignSelf: 'center',
  transform: 'all',
}));

const AddAccountText = styled.h1((props) => ({
  ...props.theme.body_m,
  opacity: 0.8,
}));

function AccountList(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'HEADER' });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    network,
    accountsList,
    seedPhrase,
    selectedAccount,
    stxAddress,
        btcAddress,
        masterPubKey,
        stxPublicKey,
        btcPublicKey,

  } = useSelector((state: StoreState) => {
    return {
      ...state.walletState,
    };
  });

  function handleAccountSelect(account:Account) {
    saveSelectedAccount(account)
     dispatch(selectAccount(account, account.stxAddress,
      account.btcAddress,
      account.masterPubKey,
      account.stxPublicKey,
      account.btcPublicKey,network));
      navigate('/');
  }

  function isAccountSelected(account:Account) : boolean {
    return account.id === selectedAccount?.id;
  }

  function handleBackButtonClick () {
    navigate('/');
  };

  function onCreateAccount (){
    console.log("clicked")
    dispatch(addAccountRequestAction(seedPhrase, network ?? 'Mainnet'))
    console.log(accountsList)
  }

  return (
    <Container>
      <TopRow title={t('CHANGE_ACCOUNT')} onClick={handleBackButtonClick} />
      <AccountContainer>
        {accountsList.map((account) => {
          return (
            <>
              <AccountRow
              key={account.id}
                account={account}
                isSelected={isAccountSelected(account)}
                onAccountSelected={handleAccountSelect}
              />
              <Seperator />
            </>
          );
        })}
        <RowContainer>
          <AddAccountContainer onClick={onCreateAccount}>
            <ButtonImage src={Plus} />
          </AddAccountContainer>
          <AddAccountText>Create a new account</AddAccountText>
        </RowContainer>
      </AccountContainer>
    </Container>
  );
}

export default AccountList;
