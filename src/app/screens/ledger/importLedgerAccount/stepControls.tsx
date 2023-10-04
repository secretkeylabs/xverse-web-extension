import styled from 'styled-components';
import ActionButton from '@components/button';
import { useTranslation } from 'react-i18next';
import { ImportLedgerSteps } from './types';

const ButtonContainer = styled.div((props) => ({
  marginLeft: 3,
  marginRight: 3,
  marginTop: props.theme.spacing(4),
  width: '100%',
}));

interface Props {
  isBitcoinSelected: boolean;
  isStacksSelected: boolean;
  isTogglerChecked: boolean;
  isButtonDisabled: boolean;
  currentStep: ImportLedgerSteps;
  selectedLedgerLiveOption: any;
  checkDeviceConnection: () => void;
  handleClickNext: () => void;
  handleClickMultipleAccounts: () => void;
  backToAssetSelection: () => void;
  updateAccountName: () => void;
  errors: {
    isConnectFailed: boolean;
    isBtcAddressRejected: boolean;
    isOrdinalsAddressRejected: boolean;
    isStxAddressRejected: boolean;
    accountNameError?: string;
  };
}

function StepControls({
  isBitcoinSelected,
  isStacksSelected,
  isTogglerChecked,
  isButtonDisabled,
  currentStep,
  selectedLedgerLiveOption,
  checkDeviceConnection,
  handleClickNext,
  handleClickMultipleAccounts,
  backToAssetSelection,
  updateAccountName,
  errors,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'LEDGER_IMPORT_SCREEN' });
  const {
    isConnectFailed,
    isBtcAddressRejected,
    isOrdinalsAddressRejected,
    isStxAddressRejected,
    accountNameError,
  } = errors;

  const handleWindowClose = () => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  switch (currentStep) {
    case ImportLedgerSteps.START:
      return <ActionButton onPress={handleClickNext} text={t('LEDGER_IMPORT_1_BUTTON')} />;
    case ImportLedgerSteps.SELECT_ASSET:
      return (
        <ActionButton
          onPress={handleClickNext}
          text={t('LEDGER_IMPORT_CONTINUE_BUTTON')}
          disabled={!isBitcoinSelected && !isStacksSelected}
        />
      );
    case ImportLedgerSteps.BEFORE_START:
      return (
        <ActionButton
          onPress={handleClickNext}
          text={t('LEDGER_IMPORT_CONTINUE_BUTTON')}
          disabled={selectedLedgerLiveOption === null}
        />
      );
    case ImportLedgerSteps.IMPORTANT_WARNING:
      return (
        <ActionButton
          onPress={handleClickNext}
          text={t('LEDGER_IMPORT_CONTINUE_BUTTON')}
          disabled={!isTogglerChecked}
        />
      );
    case ImportLedgerSteps.CONNECT_LEDGER:
      return (
        <ActionButton
          processing={isButtonDisabled}
          disabled={isButtonDisabled}
          onPress={checkDeviceConnection}
          text={t(
            isConnectFailed ? 'LEDGER_IMPORT_TRY_AGAIN_BUTTON' : 'LEDGER_IMPORT_CONNECT_BUTTON',
          )}
        />
      );
    case ImportLedgerSteps.ADD_MULTIPLE_ACCOUNTS:
      return (
        <>
          <ButtonContainer>
            <ActionButton
              disabled={isButtonDisabled}
              processing={isButtonDisabled}
              onPress={backToAssetSelection}
              transparent
              text={t('LEDGER_IMPORT_CANCEL_BUTTON')}
            />
          </ButtonContainer>
          <ButtonContainer>
            <ActionButton
              disabled={isButtonDisabled}
              processing={isButtonDisabled}
              onPress={handleClickMultipleAccounts}
              text={t('LEDGER_IMPORT_YES_BUTTON')}
            />
          </ButtonContainer>
        </>
      );
    case ImportLedgerSteps.ADD_ADDRESS:
    case ImportLedgerSteps.ADD_ORDINALS_ADDRESS:
      if (
        isConnectFailed ||
        isBtcAddressRejected ||
        isOrdinalsAddressRejected ||
        isStxAddressRejected
      ) {
        return (
          <ActionButton
            processing={isButtonDisabled}
            disabled={isButtonDisabled}
            onPress={backToAssetSelection}
            text={t('LEDGER_IMPORT_TRY_AGAIN_BUTTON')}
          />
        );
      }
      break;
    case ImportLedgerSteps.ADDRESS_ADDED:
      return <ActionButton onPress={handleClickNext} text={t('LEDGER_IMPORT_NEXT_BUTTON')} />;
    case ImportLedgerSteps.ADD_ACCOUNT_NAME:
      return (
        <ActionButton
          disabled={isButtonDisabled || !!accountNameError}
          processing={isButtonDisabled}
          onPress={updateAccountName}
          text={t('LEDGER_IMPORT_CONFIRM_BUTTON')}
        />
      );
    case ImportLedgerSteps.IMPORT_END:
      return (
        <ActionButton
          disabled={isButtonDisabled}
          processing={isButtonDisabled}
          onPress={handleWindowClose}
          text={t('LEDGER_IMPORT_CLOSE_BUTTON')}
        />
      );
    default:
      return null;
  }
}

export default StepControls;
