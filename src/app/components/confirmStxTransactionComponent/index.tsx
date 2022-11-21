import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ReactNode, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import ActionButton from '@components/button';
import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import TransactionSettingAlert from '@components/transactionSetting';
import {
  microstacksToStx, stxToMicrostacks,
} from '@secretkeylabs/xverse-core/currency';
import { StacksTransaction } from '@secretkeylabs/xverse-core/types';
import { useSelector } from 'react-redux';
import { StoreState } from '@stores/index';
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
  marginBottom: props.theme.spacing(8),
  marginTop: props.theme.spacing(14),
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
  marginTop: props.theme.spacing(5),
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));
interface Props {
  initialStxTransactions: StacksTransaction[];
  loading: boolean;
  token: string;
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
  token,
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
    if (token === 'STX') navigate('/send-stx'); else { navigate('/send-ft'); }
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

        {children}
        <TransferFeeView
          fee={microstacksToStx(getFee())}
          currency="STX"
        />
        {!isSponsored && (
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
    </>
  );
}

export default ConfirmStxTransationComponent;
