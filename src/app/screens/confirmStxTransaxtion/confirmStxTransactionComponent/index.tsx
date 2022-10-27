import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ReactNode, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import ActionButton from '@components/button';
import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import TransactionSettingAlert from '@components/transactionSetting';
import Theme from 'theme';
import {
  microstacksToStx, stxToMicrostacks,
} from '@secretkeylabs/xverse-core/currency';
import { StacksTransaction, TokenTransferPayload } from '@secretkeylabs/xverse-core/types';
import { useSelector } from 'react-redux';
import { StoreState } from '@stores/index';
import TransferAmountView from '@components/transferAmountView';
import TransferFeeView from '@components/transferFeeView';
import {
  setFee, setNonce, getNonce, signMultiStxTransactions, signTransaction,
} from '@secretkeylabs/xverse-core';

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
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

interface Props {
  initialStxTransactions: StacksTransaction[];
  loading: boolean;
  onCancelClick: () => void;
  onConfirmClick: (transactions: StacksTransaction[]) => void;
  children: ReactNode;
  isSponsored?: boolean;
}

function ConfirmStxTransationComponent({
  initialStxTransactions,
  loading,
  isSponsored,
  children,
  onConfirmClick,
  onCancelClick,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const {
    selectedAccount,
    seedPhrase,
    network,
  } = useSelector((state: StoreState) => state.walletState);
  const [stateTx] = useState(initialStxTransactions);
  const [openTransactionSettingModal, setOpenTransactionSettingModal] = useState(false);
  const navigate = useNavigate();
  const [buttonLoading, setButtonLoading] = useState(loading);

  const handleBackButtonClick = () => {
    navigate('/send-stx');
  };

  useEffect(() => {
    setButtonLoading(loading);
  }, [loading]);

  const getFee = () => (isSponsored
    ? new BigNumber(0)
    : new BigNumber(
      stateTx
        .map((tx) => tx.auth.spendingCondition?.fee ?? BigInt(0))
        .reduce((prev, curr) => prev + curr, BigInt(0))
        .toString(10),
    ));

  const getTxNonce = (): string => {
    const nonce = getNonce(stateTx[0]);
    return nonce.toString();
  };

  const getAmount = () => {
    const txPayload = stateTx[0].payload as TokenTransferPayload;
    const amount = new BigNumber(txPayload.amount.toString(10));
    return microstacksToStx(amount);
  };

  const onAdvancedSettingClick = () => {
    setOpenTransactionSettingModal(true);
  };

  const closeTransactionSettingAlert = () => {
    setOpenTransactionSettingModal(false);
  };

  const onConfirmButtonClick = async () => {
    let signedTxs: StacksTransaction[] = [];
    if (stateTx.length === 1) {
      const signedContractCall = await signTransaction(
        stateTx[0],
        seedPhrase,
        selectedAccount?.id ?? 0,
        network,
      );
      signedTxs.push(signedContractCall);
    } else if (stateTx.length === 2) {
      signedTxs = await signMultiStxTransactions(
        stateTx,
        selectedAccount?.id ?? 0,
        'Testnet',
        seedPhrase,
      );
    }
    onConfirmClick(signedTxs);
  };

  const advancedSettingButton = (
    <ActionButton
      src={SettingIcon}
      text={t('ADVANCED_SETTING')}
      buttonColor="transparent"
      buttonAlignment="flex-start"
      onPress={onAdvancedSettingClick}
    />
  );
  const applyTxSettings = (settingFee: string, nonce?: string) => {
    const fee = stxToMicrostacks(new BigNumber(settingFee));
    setFee(stateTx[0], BigInt(fee.toString()));
    if (nonce && nonce !== '') {
      setNonce(stateTx[0], BigInt(nonce));
    }
    setOpenTransactionSettingModal(false);
  };

  return (
    <>
      <TopRow title={t('SEND')} onClick={handleBackButtonClick} />
      <Container>
        <TransferAmountView currency="STX" amount={getAmount()} />
        {children}
        <TransferFeeView
          fee={microstacksToStx(getFee())}
          currency="STX"
        />
        {!isSponsored && advancedSettingButton}
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
        <ActionButton
          text={t('CANCEL')}
          buttonColor="transparent"
          disabled={buttonLoading}
          buttonBorderColor={Theme.colors.background.elevation2}
          onPress={onCancelClick}
          margin={3}
        />
        <ActionButton
          text={t('CONFIRM')}
          disabled={buttonLoading}
          processing={buttonLoading}
          onPress={onConfirmButtonClick}
        />
      </ButtonContainer>
    </>
  );
}

export default ConfirmStxTransationComponent;
