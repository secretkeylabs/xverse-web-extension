import useSelectedAccount from '@hooks/useSelectedAccount';
import SelectAccount from '@screens/connect/selectAccount';
import RoutePaths from 'app/routes/paths';
import { useNavigate } from 'react-router-dom';

/* eslint-disable import/prefer-default-export */
export function SelectAccountPrompt() {
  const selectedAccount = useSelectedAccount();
  const navigate = useNavigate();

  const handleSwitchAccount = () => {
    navigate(`${RoutePaths.AccountList}?hideListActions=true`);
  };

  return <SelectAccount account={selectedAccount} handlePressAccount={handleSwitchAccount} />;
}
