import AccountRow from '@components/accountRow';
import TopRow from '@components/topRow';
import { Account } from '@utils/utils';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Plus from '@assets/img/dashboard/plus.svg';

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
  //overflowY:'scroll'
}));

interface Props {
  accounts: Account[];
  loadingActiveAccount: boolean;
  selectedAccount: Account | null;
  onClose: () => void;
  onCreate: () => void;
  onSelected: (account: Account) => void;
}
const Seperator = styled.div((props) => ({
  width: '100%',
  height: 0,
  border: `0.2px solid ${props.theme.colors.background.elevation2}`,
  marginTop: props.theme.spacing(8),
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

const ButtonImage = styled.img((props) => ({
  alignSelf: 'center',
  transform: 'all',
}));

const AddAccountText = styled.h1((props) => ({
  ...props.theme.body_m,
  opacity: 0.8,
}));

function AccountList({
  accounts,
  loadingActiveAccount,
  selectedAccount,
  onClose,
  onCreate,
  onSelected,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'HEADER' });
  const navigate = useNavigate();
  const a: Account[] = [
    {
      btcAddress: '3QAmUHT9jbsjewuAAjta6mtpH8M4tgQJcE',
      btcPublicKey: '039137ce06037cd553b3fd3297fc9da72902ab56da1dae90bae21118c7c79e9144',
      id: 0,
      masterPubKey: '03306da4bddabf83dd0da13f8116179c1406487172380961236f89ebf7212de4fd',
      stxAddress: 'SP1TWMXZB83X6KJAYEHNYVPAGX60Q9C2NVXBQCJMY',
      stxPublicKey: '02d9e3e83034232ab495ca71c43e1ff7fab1413da3b9c05abf4b6925a3642d47cb',
    },
    {
      btcAddress: '36eEWA3dgTbKYd11xggpdccQQxAXTvjzFD',
      btcPublicKey: '020a0e6761e255363aac7a491bd50baef1a946561cbd49507e7feaff4f26785a36',
      id: 1,
      masterPubKey: '03306da4bddabf83dd0da13f8116179c1406487172380961236f89ebf7212de4fd',
      stxAddress: 'SP2T1CZF3XXZ8TFP62ESRQ68M9VDJE6BR9M7EWZRT',
      stxPublicKey: '0357e5d3f8fac1419da4bf5e930cb8f68d18962d3d838974f83c0ae2e695867518',
    },
    {
      btcAddress: '3C224GbvNZ836SwfRPMncCsEXsdQD1bX41',
      btcPublicKey: '03fb333da2efa2541eea8787666346c6dcaeb80200b0cfdded90e901ac685a94d4',
      id: 2,
      masterPubKey: '03306da4bddabf83dd0da13f8116179c1406487172380961236f89ebf7212de4fd',
      stxAddress: 'SP3PZVGQZ1X4CA59KEYNDJXXAQXGA70YRGAMQ9V90',
      stxPublicKey: '021db2d34e86196d44e5c856adf45288f9eec34ff2d17a5db6b73cf9dccd503b54',
    },
    {
      btcAddress: '3QK6U89ZejRn6kiPDdzitMvn3g4fk2CqLW',
      btcPublicKey: '022b228bee43d9b5ab301b9124ce6ab56fb9246f9d3389e4915ac0dd98c298fd6c',
      id: 3,
      masterPubKey: '03306da4bddabf83dd0da13f8116179c1406487172380961236f89ebf7212de4fd',
      stxAddress: 'SP2FFKDKR122BZWS7GDPFWC0J0FK4WMW5NPQ0Z21M',
      stxPublicKey: '033980f56f21108b63eaa1b43df56093876b3fa66ca0caafe0b32d8d449cfd36f3',
    },
  ];
  accounts = a;

  //change
  function handleAccountSelect() {
    onSelected(accounts[0]);
  }

  const handleBackButtonClick = () => {
    navigate('/home');
  };
  return (
    <>
      <TopRow title={t('CHANGE_ACCOUNT')} onClick={handleBackButtonClick} />
      <AccountContainer>
        {accounts.map((account) => {
          return (
            <>
              <AccountRow
                account={account}
                isSelected={false}
                onAccountSelected={handleAccountSelect}
              />
              <Seperator />
            </>
          );
        })}
        <RowContainer>
          <AddAccountContainer>
            <ButtonImage src={Plus} />
          </AddAccountContainer>
          <AddAccountText>Create a new account</AddAccountText>
        </RowContainer>
      </AccountContainer>
    </>
  );
}

export default AccountList;
