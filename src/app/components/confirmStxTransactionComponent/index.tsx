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
import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectStxIcon from '@assets/img/ledger/ledger_import_connect_stx.svg';
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

export const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  paddingTop: props.theme.spacing(12),
  paddingBottom: props.theme.spacing(12),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  backgroundColor: props.theme.colors.background.elevation0,
  // position: 'sticky',
  // left: 0,
  // bottom: 0,
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
  gap: props.theme.spacing(6),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(20),
  marginTop: props.theme.spacing(20),
}));

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white[0],
  textAlign: 'left',
}));

const RequestedByText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[400],
  marginTop: props.theme.spacing(4),
  textAlign: 'left',
}));

const TitleContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(16),
}));

interface Props {
  initialStxTransactions: StacksTransaction[];
  loading: boolean;
  onCancelClick: () => void;
  onConfirmClick: (transactions: StacksTransaction[]) => void;
  children: ReactNode;
  isSponsored?: boolean;
  skipModal?: boolean;
  isAsset?: boolean;
  title?: string;
  subTitle?: string;
}

function ConfirmStxTransationComponent({
  initialStxTransactions,
  loading,
  isSponsored,
  children,
  isAsset,
  title,
  subTitle,
  onConfirmClick,
  onCancelClick,
  skipModal = false,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });
  const selectedNetwork = useNetworkSelector();
  const [showFeeSettings, setShowFeeSettings] = useState(false);
  const { selectedAccount, seedPhrase } = useWalletSelector();
  const [openTransactionSettingModal, setOpenTransactionSettingModal] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(loading);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isTxApproved, setIsTxApproved] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);

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
            .toString(10),
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
        selectedNetwork,
      );
      signedTxs.push(signedContractCall);
    } else if (initialStxTransactions.length === 2) {
      signedTxs = await signMultiStxTransactions(
        initialStxTransactions,
        selectedAccount?.id ?? 0,
        selectedNetwork,
        seedPhrase,
      );
    }
    onConfirmClick(signedTxs);
  };

  const applyTxSettings = ({
    fee: settingFee,
    nonce,
  }: {
    fee: string;
    feeRate?: string;
    nonce?: string;
  }) => {
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

    if (selectedAccount.deviceAccountIndex === undefined) {
      console.error('No account found');
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
      const signedTxs = await signLedgerStxTransaction({
        transport,
        transactionBuffer: initialStxTransactions[0].serialize(),
        addressIndex: selectedAccount.deviceAccountIndex,
      });
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
        <TitleContainer>
          {!isAsset && (
            <ReviewTransactionText>{title ?? t('REVIEW_TRANSACTION')}</ReviewTransactionText>
          )}
          {!!subTitle && <RequestedByText>{subTitle}</RequestedByText>}
        </TitleContainer>
        {children}
        <TransferFeeView fee={microstacksToStx(getFee())} currency="STX" />
        {initialStxTransactions[0]?.payload?.amount && (
          <TransferFeeView
            fee={microstacksToStx(
              getFee().plus(new BigNumber(initialStxTransactions[0]?.payload.amount?.toString(10))),
            )}
            currency="STX"
            title={t('TOTAL')}
          />
        )}
        {isSponsored ? (
          <SponsoredInfoText>{t('SPONSORED_TX_INFO')}</SponsoredInfoText>
        ) : (
          <Button onClick={onAdvancedSettingClick}>
            <>
              <ButtonImage src={SettingIcon} />
              <ButtonText>{t('ADVANCED_SETTING')}</ButtonText>
            </>
          </Button>
        )}
        <TransactionSettingAlert
          visible={openTransactionSettingModal}
          fee={microstacksToStx(getFee()).toString()}
          type="STX"
          nonce={getTxNonce()}
          onApplyClick={applyTxSettings}
          onCrossClick={closeTransactionSettingAlert}
          showFeeSettings={showFeeSettings}
          setShowFeeSettings={setShowFeeSettings}
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
        {currentStepIndex === 0 && (
          <LedgerConnectionView
            title={signatureRequestTranslate('LEDGER.CONNECT.TITLE')}
            text={signatureRequestTranslate('LEDGER.CONNECT.SUBTITLE', { name: 'Stacks' })}
            titleFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_TITLE')}
            textFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_SUBTITLE')}
            imageDefault={ledgerConnectStxIcon}
            isConnectSuccess={isConnectSuccess}
            isConnectFailed={isConnectFailed}
          />
        )}
        {currentStepIndex === 1 && (
          <LedgerConnectionView
            title={t('LEDGER.CONFIRM.TITLE')}
            text={t('LEDGER.CONFIRM.SUBTITLE')}
            titleFailed={t('LEDGER.CONFIRM.ERROR_TITLE')}
            textFailed={t('LEDGER.CONFIRM.ERROR_SUBTITLE')}
            imageDefault={ledgerConnectDefaultIcon}
            isConnectSuccess={isTxApproved}
            isConnectFailed={isTxRejected}
          />
        )}
        <SuccessActionsContainer>
          <ActionButton
            onPress={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
            text={t(
              isTxRejected || isConnectFailed ? 'LEDGER.RETRY_BUTTON' : 'LEDGER.CONNECT_BUTTON',
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
