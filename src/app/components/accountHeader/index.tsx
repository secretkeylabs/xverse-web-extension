import AccountRow from '@components/accountRow';
import useWalletReducer from '@hooks/useWalletReducer';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import OptionsDialog from '@components/optionsDialog/optionsDialog';
import useOptionsDialog from '@hooks/useOptionsDialog';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { DotsThreeVertical } from '@phosphor-icons/react';
import RoutePaths from 'app/routes/paths';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${props.theme.space.l} ${props.theme.space.m}`,
}));

const OptionsButton = styled.button(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  background: 'transparent',
  opacity: 0.7,
  transition: 'opacity 0.1s ease',
  '&:hover': {
    opacity: 1,
  },
  '&:active': {
    opacity: 0.6,
  },
}));

const ButtonRow = styled.button`
  display: flex;
  align-items: center;
  background-color: transparent;
  justify-content: flex-start;
  padding-top: ${(props) => props.theme.space.s};
  padding-bottom: ${(props) => props.theme.space.s};
  padding-left: ${(props) => props.theme.space.l};
  padding-right: ${(props) => props.theme.space.l};
  font: ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_0};
  transition: background-color 0.2s ease;
  :hover {
    background-color: ${(props) => props.theme.colors.elevation3};
  }
  :active {
    background-color: ${(props) => props.theme.colors.elevation3};
  }
`;

type Props = {
  disableMenuOption?: boolean;
  disableAccountSwitch?: boolean;
};

function AccountHeaderComponent({
  disableMenuOption = false,
  disableAccountSwitch = false,
}: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const selectedAccount = useSelectedAccount();
  const menuDialog = useOptionsDialog();

  const { t: optionsDialogTranslation } = useTranslation('translation', {
    keyPrefix: 'OPTIONS_DIALOG',
  });
  const { lockWallet } = useWalletReducer();

  const handleAccountSelect = () => {
    if (!disableAccountSwitch) {
      navigate(RoutePaths.AccountList, { state: { from: pathname } });
    }
  };

  const handleLockWallet = async () => {
    await lockWallet();
  };

  return (
    <Container>
      <AccountRow
        account={selectedAccount!}
        isSelected
        onAccountSelected={handleAccountSelect}
        disabledAccountSelect={disableAccountSwitch}
      />
      {!disableMenuOption && (
        <OptionsButton aria-label="Open Header Options" onClick={menuDialog.open}>
          <DotsThreeVertical size={20} fill="white" weight="bold" />
        </OptionsButton>
      )}
      {menuDialog.isVisible && (
        <OptionsDialog closeDialog={menuDialog.close} optionsDialogIndents={menuDialog.indents}>
          <ButtonRow onClick={handleAccountSelect}>
            {optionsDialogTranslation('SWITCH_ACCOUNT')}
          </ButtonRow>
          <ButtonRow onClick={handleLockWallet}>{optionsDialogTranslation('LOCK')}</ButtonRow>
        </OptionsDialog>
      )}
    </Container>
  );
}

export default AccountHeaderComponent;
