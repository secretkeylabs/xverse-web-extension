import useSelectedAccount from '@hooks/useSelectedAccount';
import SelectAccount from '@screens/connect/selectAccount';
import { useLocation, useNavigate } from 'react-router-dom';

/* eslint-disable import/prefer-default-export */
export function SelectAccountPrompt() {
  const selectedAccount = useSelectedAccount();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleSwitchAccount = () => {
    navigate('/account-list?hideListActions=true', { state: { from: pathname } });
  };

  return <SelectAccount account={selectedAccount} handlePressAccount={handleSwitchAccount} />;
}
