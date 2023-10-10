import threeDotsIcon from '@assets/img/dots_three_vertical.svg';
import AccountRow from '@components/accountRow';
import PasswordInput from '@components/passwordInput';
import ResetWalletPrompt from '@components/resetWallet';
import useWalletReducer from '@hooks/useWalletReducer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import OptionsDialog, { OPTIONS_DIALOG_WIDTH } from '@components/optionsDialog/optionsDialog';
import useWalletSelector from '@hooks/useWalletSelector';

const SelectedAccountContainer = styled.div<{ showBorderBottom?: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${props.theme.spacing(10)}px ${props.theme.spacing(8)}px`,
  borderBottom: props.showBorderBottom
    ? `0.5px solid ${props.theme.colors.background.elevation3}`
    : 'none',
}));

const ResetWalletContainer = styled.div((props) => ({
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'fixed',
  zIndex: 10,
  background: 'rgba(25, 25, 48, 0.5)',
  backdropFilter: 'blur(16px)',
  padding: props.theme.spacing(8),
  paddingTop: props.theme.spacing(30),
}));

const OptionsButton = styled.button(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  background: 'transparent',
}));

const ButtonRow = styled.button`
  display: flex;
  align-items: center;
  background-color: transparent;
  justify-content: flex-start;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 11px;
  padding-bottom: 11px;
  font: ${(props) => props.theme.body_medium_m};
  color: ${(props) => props.theme.colors.white['0']};
  transition: background-color 0.2s ease;
  :hover {
    background-color: ${(props) => props.theme.colors.background.elevation3};
  }
  :active {
    background-color: ${(props) => props.theme.colors.background.elevation3};
  }
`;

const WarningButton = styled(ButtonRow)`
  color: ${(props) => props.theme.colors.feedback.error};
`;

interface AccountHeaderComponentProps {
  disableMenuOption?: boolean;
  disableAccountSwitch?: boolean;
  showBorderBottom?: boolean;
}

function AccountHeaderComponent({
  disableMenuOption = false,
  disableAccountSwitch = false,
  showBorderBottom = true,
}: AccountHeaderComponentProps) {
  const navigate = useNavigate();
  const { selectedAccount } = useWalletSelector();

  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const { t: optionsDialogTranslation } = useTranslation('translation', {
    keyPrefix: 'OPTIONS_DIALOG',
  });
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const [showResetWalletPrompt, setShowResetWalletPrompt] = useState(false);
  const [showResetWalletDisplay, setShowResetWalletDisplay] = useState(false);
  const [password, setPassword] = useState('');
  const { unlockWallet, lockWallet, resetWallet } = useWalletReducer();
  const [error, setError] = useState('');
  const [optionsDialogIndents, setOptionsDialogIndents] = useState<
    { top: string; left: string } | undefined
  >();

  const handleResetWallet = async () => {
    await resetWallet();
  };

  const handlePasswordNextClick = async () => {
    try {
      await unlockWallet(password);
      setPassword('');
      setError('');
      handleResetWallet();
    } catch (e) {
      setError(t('INCORRECT_PASSWORD_ERROR'));
    }
  };

  const onGoBack = () => {
    navigate(0);
  };

  const onResetWalletPromptClose = () => {
    setShowResetWalletPrompt(false);
  };

  const handleResetWalletPromptOpen = () => {
    setShowResetWalletPrompt(true);
  };

  const openResetWalletScreen = () => {
    setShowResetWalletPrompt(false);
    setShowResetWalletDisplay(true);
  };

  const handleAccountSelect = () => {
    if (!disableAccountSwitch) {
      navigate('/account-list');
    }
  };

  const openOptionsDialog = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShowOptionsDialog(true);

    setOptionsDialogIndents({
      top: `${(event.target as HTMLElement).parentElement?.getBoundingClientRect().top}px`,
      left: `calc(${
        (event.target as HTMLElement).parentElement?.getBoundingClientRect().right
      }px - ${OPTIONS_DIALOG_WIDTH}px)`,
    });
  };

  const closeOptionsDialog = () => {
    setShowOptionsDialog(false);
  };

  const handleLockWallet = async () => {
    await lockWallet();
  };

  return (
    <>
      {showResetWalletDisplay && (
        <ResetWalletContainer>
          <PasswordInput
            title={t('ENTER_PASSWORD')}
            inputLabel={t('PASSWORD')}
            enteredPassword={password}
            setEnteredPassword={setPassword}
            handleContinue={handlePasswordNextClick}
            handleBack={onGoBack}
            passwordError={error}
            stackButtonAlignment
          />
        </ResetWalletContainer>
      )}
      <SelectedAccountContainer showBorderBottom={showBorderBottom}>
        <AccountRow
          account={selectedAccount!}
          isSelected
          onAccountSelected={handleAccountSelect}
          disabledAccountSelect={disableAccountSwitch}
        />
        {!disableMenuOption && (
          <OptionsButton onClick={openOptionsDialog}>
            <img src={threeDotsIcon} alt="Options" />
          </OptionsButton>
        )}
        {showOptionsDialog && (
          <OptionsDialog
            closeDialog={closeOptionsDialog}
            optionsDialogIndents={optionsDialogIndents}
          >
            <ButtonRow onClick={handleAccountSelect}>
              {optionsDialogTranslation('SWITCH_ACCOUNT')}
            </ButtonRow>
            <ButtonRow onClick={handleLockWallet}>{optionsDialogTranslation('LOCK')}</ButtonRow>
            <WarningButton onClick={handleResetWalletPromptOpen}>
              {optionsDialogTranslation('RESET_WALLET')}
            </WarningButton>
          </OptionsDialog>
        )}
      </SelectedAccountContainer>
      <ResetWalletPrompt
        showResetWalletPrompt={showResetWalletPrompt}
        onResetWalletPromptClose={onResetWalletPromptClose}
        openResetWalletScreen={openResetWalletScreen}
      />
    </>
  );
}

export default AccountHeaderComponent;
