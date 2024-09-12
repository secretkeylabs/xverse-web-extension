import Button from '@ui-library/button';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ImportLedgerSteps } from './types';

const VerticalButtonContainer = styled.div((props) => ({
  display: 'flex',
  gap: props.theme.space.s,
  flexDirection: 'column',
  width: '100%',
}));

type Props = {
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
};

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
      return <Button onClick={handleClickNext} title={t('LEDGER_IMPORT_1_BUTTON')} />;
    case ImportLedgerSteps.SELECT_ASSET:
      return (
        <Button
          onClick={handleClickNext}
          title={t('LEDGER_IMPORT_CONTINUE_BUTTON')}
          disabled={!isBitcoinSelected && !isStacksSelected}
        />
      );
    case ImportLedgerSteps.BEFORE_START:
      return (
        <Button
          onClick={handleClickNext}
          title={t('LEDGER_IMPORT_CONTINUE_BUTTON')}
          disabled={selectedLedgerLiveOption === null}
        />
      );
    case ImportLedgerSteps.IMPORTANT_WARNING:
      return (
        <Button
          onClick={handleClickNext}
          title={t('LEDGER_IMPORT_CONTINUE_BUTTON')}
          disabled={!isTogglerChecked}
        />
      );
    case ImportLedgerSteps.CONNECT_LEDGER:
      return (
        <Button
          loading={isButtonDisabled}
          disabled={isButtonDisabled}
          onClick={checkDeviceConnection}
          title={t(
            isConnectFailed ? 'LEDGER_IMPORT_TRY_AGAIN_BUTTON' : 'LEDGER_IMPORT_CONNECT_BUTTON',
          )}
        />
      );
    case ImportLedgerSteps.ADD_MULTIPLE_ACCOUNTS:
      return (
        <VerticalButtonContainer>
          <Button
            disabled={isButtonDisabled}
            loading={isButtonDisabled}
            onClick={handleClickMultipleAccounts}
            title={t('LEDGER_IMPORT_YES_BUTTON')}
          />
          <Button
            disabled={isButtonDisabled}
            loading={isButtonDisabled}
            onClick={backToAssetSelection}
            variant="secondary"
            title={t('LEDGER_IMPORT_CANCEL_BUTTON')}
          />
        </VerticalButtonContainer>
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
          <Button
            loading={isButtonDisabled}
            disabled={isButtonDisabled}
            onClick={backToAssetSelection}
            title={t('LEDGER_IMPORT_TRY_AGAIN_BUTTON')}
          />
        );
      }
      break;
    case ImportLedgerSteps.ADDRESS_ADDED:
      return (
        <Button
          loading={isButtonDisabled}
          disabled={isButtonDisabled}
          onClick={handleClickNext}
          title={t('LEDGER_IMPORT_NEXT_BUTTON')}
        />
      );
    case ImportLedgerSteps.ADD_ACCOUNT_NAME:
      return (
        <Button
          loading={isButtonDisabled}
          disabled={isButtonDisabled}
          onClick={updateAccountName}
          title={t('LEDGER_IMPORT_CONFIRM_BUTTON')}
        />
      );
    case ImportLedgerSteps.IMPORT_END:
      return (
        <Button
          loading={isButtonDisabled}
          disabled={isButtonDisabled}
          onClick={handleWindowClose}
          title={t('LEDGER_IMPORT_CLOSE_BUTTON')}
        />
      );
    default:
      return null;
  }
  return null;
}

export default StepControls;
