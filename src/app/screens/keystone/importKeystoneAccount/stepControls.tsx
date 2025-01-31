import Button from '@ui-library/button';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ImportKeystoneSteps } from './types';

const VerticalButtonContainer = styled.div((props) => ({
  display: 'flex',
  gap: props.theme.space.s,
  flexDirection: 'column',
  width: '100%',
}));

type Props = {
  isButtonDisabled: boolean;
  currentStep: ImportKeystoneSteps;
  onConnect: () => void;
  handleClickNext: () => void;
  updateAccountName: () => void;
  errors: {
    isConnectFailed: boolean;
  };
};

function StepControls({
  isButtonDisabled,
  currentStep,
  onConnect,
  handleClickNext,
  updateAccountName,
  errors,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'KEYSTONE_IMPORT_SCREEN' });
  const { isConnectFailed } = errors;

  const handleWindowClose = () => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  switch (currentStep) {
    case ImportKeystoneSteps.START:
      return <Button onClick={handleClickNext} title={t('KEYSTONE_IMPORT_1_BUTTON')} />;
    case ImportKeystoneSteps.CONNECT_KEYSTONE:
      return (
        <Button
          loading={isButtonDisabled}
          disabled={isButtonDisabled}
          onClick={onConnect}
          title={t(
            isConnectFailed ? 'KEYSTONE_IMPORT_TRY_AGAIN_BUTTON' : 'KEYSTONE_IMPORT_CONNECT_BUTTON',
          )}
        />
      );
    case ImportKeystoneSteps.ADDRESS_ADDED:
      return (
        <Button
          loading={isButtonDisabled}
          disabled={isButtonDisabled}
          onClick={handleClickNext}
          title={t('KEYSTONE_IMPORT_NEXT_BUTTON')}
        />
      );
    case ImportKeystoneSteps.ADD_ACCOUNT_NAME:
      return (
        <Button
          loading={isButtonDisabled}
          disabled={isButtonDisabled}
          onClick={updateAccountName}
          title={t('KEYSTONE_IMPORT_CONFIRM_BUTTON')}
        />
      );
    case ImportKeystoneSteps.IMPORT_END:
      return (
        <Button
          loading={isButtonDisabled}
          disabled={isButtonDisabled}
          onClick={handleWindowClose}
          title={t('KEYSTONE_IMPORT_CLOSE_BUTTON')}
        />
      );
    default:
      return null;
  }
  return null;
}

export default StepControls;
