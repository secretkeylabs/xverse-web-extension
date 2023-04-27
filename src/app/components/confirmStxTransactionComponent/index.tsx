import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ReactNode, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import ActionButton from '@components/button';
import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import TransactionSettingAlert from '@components/transactionSetting';
import { microstacksToStx, stxToMicrostacks } from '@secretkeylabs/xverse-core/currency';
import { StacksTransaction } from '@secretkeylabs/xverse-core/types';
import TransferFeeView from '@components/transferFeeView';
import {
  setFee,
  setNonce,
  getNonce,
  signMultiStxTransactions,
  signTransaction,
  signLedgerStxTransaction,
} from '@secretkeylabs/xverse-core';
import useWalletSelector from '@hooks/useWalletSelector';
import useNetworkSelector from '@hooks/useNetwork';
import Transport from '@ledgerhq/hw-transport-webusb';
import BottomModal from '@components/bottomModal';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import LedgerConnectDefault from '@assets/img/ledger/ledger_connect_default.svg';
import { ledgerDelay } from '@common/utils/ledger';
import { isHardwareAccount } from '@utils/helper';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-top: 22px;
  margin-left: 16px;
  margin-right: 16px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: props.theme.spacing(20),
  marginTop: props.theme.spacing(12),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const TransparentButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(2),
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  width: '100%',
  marginTop: props.theme.spacing(10),
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const TransferFeeContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(12),
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

const SponsoredInfoText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
}));

const SuccessActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(20),
  marginTop: props.theme.spacing(20),
}));

interface Props {
  initialStxTransactions: StacksTransaction[];
  loading: boolean;
  onCancelClick: () => void;
  onConfirmClick: (transactions: StacksTransaction[]) => void;
  children: ReactNode;
  isSponsored?: boolean;
  skipModal?: boolean;
}

function ConfirmStxTransationComponent({
  initialStxTransactions,
  loading,
  isSponsored,
  children,
  onConfirmClick,
  onCancelClick,
  skipModal = false,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const selectedNetwork = useNetworkSelector();
  const { selectedAccount, seedPhrase } = useWalletSelector();
  const [openTransactionSettingModal, setOpenTransactionSettingModal] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(loading);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState<boolean>(false);
  const [isConnectFailed, setIsConnectFailed] = useState<boolean>(false);
  const [isTxApproved, setIsTxApproved] = useState<boolean>(false);
  const [isTxRejected, setIsTxRejected] = useState<boolean>(false);

  useEffect(() => {
    setButtonLoading(loading);
  }, [loading]);

  const getFee = () =>
    isSponsored
      ? new BigNumber(0)
      : new BigNumber(
          initialStxTransactions
            .map((tx) => tx?.auth?.spendingCondition?.fee ?? BigInt(0))
            .reduce((prev, curr) => prev + curr, BigInt(0))
            .toString(10)
        );

  const getTxNonce = (): string => {
    const nonce = getNonce(initialStxTransactions[0]);
    return nonce.toString();
  };

  const onAdvancedSettingClick = () => {
    setOpenTransactionSettingModal(true);
  };

  const closeTransactionSettingAlert = () => {
    setOpenTransactionSettingModal(false);
  };

  const onConfirmButtonClick = async () => {
    if (skipModal) {
      onConfirmClick(initialStxTransactions);
      return;
    }
    if (isHardwareAccount(selectedAccount)) {
      setIsModalVisible(true);
      return;
    }

    let signedTxs: StacksTransaction[] = [];
    if (initialStxTransactions.length === 1) {
      const signedContractCall = await signTransaction(
        initialStxTransactions[0],
        seedPhrase,
        selectedAccount?.id ?? 0,
        selectedNetwork
      );
      signedTxs.push(signedContractCall);
    } else if (initialStxTransactions.length === 2) {
      signedTxs = await signMultiStxTransactions(
        initialStxTransactions,
        selectedAccount?.id ?? 0,
        selectedNetwork,
        seedPhrase
      );
    }
    onConfirmClick(signedTxs);
  };

  const applyTxSettings = (settingFee: string, nonce?: string) => {
    const fee = stxToMicrostacks(new BigNumber(settingFee));
    setFee(initialStxTransactions[0], BigInt(fee.toString()));
    if (nonce && nonce !== '') {
      setNonce(initialStxTransactions[0], BigInt(nonce));
    }
    setOpenTransactionSettingModal(false);
  };

  const handleConnectAndConfirm = async () => {
    if (!selectedAccount) {
      console.error('No account selected');
      return;
    }
    setIsButtonDisabled(true);

    const transport = await Transport.create();

    if (!transport) {
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
      setIsButtonDisabled(false);
      return;
    }

    setIsConnectSuccess(true);
    await ledgerDelay(1500);
    setCurrentStepIndex(1);
    try {
      const signedTxs = await signLedgerStxTransaction(
        transport,
        initialStxTransactions[0],
        selectedAccount.id
      );
      setIsTxApproved(true);
      await ledgerDelay(1500);
      onConfirmClick([signedTxs]);
    } catch (e) {
      console.error(e);
      setIsTxRejected(true);
      setIsButtonDisabled(false);
    } finally {
      transport.close();
    }
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectSuccess(false);
    setCurrentStepIndex(0);
  };

  return (
    <>
      <Container>
        {children}
        <TransferFeeContainer>
          <TransferFeeView fee={microstacksToStx(getFee())} currency="STX" />
        </TransferFeeContainer>

        {!isSponsored && (
          <Button onClick={onAdvancedSettingClick}>
            <>
              <ButtonImage src={SettingIcon} />
              <ButtonText>{t('ADVANCED_SETTING')}</ButtonText>
            </>
          </Button>
        )}
        {isSponsored && <SponsoredInfoText>{t('SPONSORED_TX_INFO')}</SponsoredInfoText>}
        <TransactionSettingAlert
          visible={openTransactionSettingModal}
          fee={microstacksToStx(getFee()).toString()}
          type="STX"
          nonce={getTxNonce()}
          onApplyClick={applyTxSettings}
          onCrossClick={closeTransactionSettingAlert}
        />
      </Container>
      <ButtonContainer>
        <TransparentButtonContainer>
          <ActionButton
            text={t('CANCEL')}
            transparent
            disabled={buttonLoading}
            onPress={onCancelClick}
          />
        </TransparentButtonContainer>
        <ActionButton
          text={t('CONFIRM')}
          disabled={buttonLoading}
          processing={buttonLoading}
          onPress={onConfirmButtonClick}
        />
      </ButtonContainer>
      <BottomModal header="" visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        {currentStepIndex === 0 ? (
          <LedgerConnectionView
            title={t('LEDGER.CONNECT.TITLE')}
            text={t('LEDGER.CONNECT.SUBTITLE')}
            titleFailed={t('LEDGER.CONNECT.ERROR_TITLE')}
            textFailed={t('LEDGER.CONNECT.ERROR_SUBTITLE')}
            imageDefault={LedgerConnectDefault}
            isConnectSuccess={isConnectSuccess}
            isConnectFailed={isConnectFailed}
          />
        ) : currentStepIndex === 1 ? (
          <LedgerConnectionView
            title={t('LEDGER.CONFIRM.TITLE')}
            text={t('LEDGER.CONFIRM.SUBTITLE')}
            titleFailed={t('LEDGER.CONFIRM.ERROR_TITLE')}
            textFailed={t('LEDGER.CONFIRM.ERROR_SUBTITLE')}
            imageDefault={LedgerConnectDefault}
            isConnectSuccess={isTxApproved}
            isConnectFailed={isTxRejected}
          />
        ) : null}
        <SuccessActionsContainer>
          <ActionButton
            onPress={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
            text={t(
              isTxRejected || isConnectFailed ? 'LEDGER.RETRY_BUTTON' : 'LEDGER.CONNECT_BUTTON'
            )}
            disabled={isButtonDisabled}
            processing={isButtonDisabled}
          />
          <ActionButton onPress={onCancelClick} text={t('LEDGER.CANCEL_BUTTON')} transparent />
        </SuccessActionsContainer>
      </BottomModal>
    </>
  );
}

export default ConfirmStxTransationComponent;
