import useSelectedAccount from '@hooks/useSelectedAccount';
import SelectAccount from '@screens/connect/selectAccount';
import { useNavigate } from 'react-router-dom';

/* eslint-disable import/prefer-default-export */
export function SelectAccountPrompt() {
  const selectedAccount = useSelectedAccount();
  const navigate = useNavigate();

  const handleSwitchAccount = () => {
    navigate('/account-list?hideListActions=true');
  };

  return <SelectAccount account={selectedAccount} handlePressAccount={handleSwitchAccount} />;
}
