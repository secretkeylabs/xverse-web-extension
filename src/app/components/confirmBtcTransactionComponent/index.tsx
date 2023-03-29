import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ReactNode, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import ActionButton from '@components/button';
import AssetIcon from '@assets/img/transactions/Assets.svg';
import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import TransactionSettingAlert from '@components/transactionSetting';
import { useSelector } from 'react-redux';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import { StoreState } from '@stores/index';
import { signBtcTransaction } from '@secretkeylabs/xverse-core/transactions';
import { useMutation } from '@tanstack/react-query';
import {
  Recipient,
  SignedBtcTx,
  signNonOrdinalBtcSendTransaction,
  signOrdinalSendTransaction,
} from '@secretkeylabs/xverse-core/transactions/btc';
import {
  BtcUtxoDataResponse,
  ErrorCodes,
  getBtcFiatEquivalent,
  ResponseError,
  satsToBtc,
} from '@secretkeylabs/xverse-core';
import TransactionDetailComponent from '../transactionDetailComponent';
import BtcRecipientComponent from './btcRecipientComponent';

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: props.theme.spacing(11),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(5),
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

const ErrorContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(24),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const ErrorText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.feedback.error,
}));

interface ReviewTransactionTitleProps {
  isOridnalTx: boolean;
}
const ReviewTransactionText = styled.h1<ReviewTransactionTitleProps>((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white[0],
  marginBottom: props.theme.spacing(16),
  textAlign: props.isOridnalTx ? 'center' : 'left',
}));

interface Props {
  fee: BigNumber;
  loadingBroadcastedTx: boolean;
  signedTxHex: string;
  ordinalTxUtxo?: BtcUtxoDataResponse;
  recipients: Recipient[];
  children?: ReactNode;
  assetDetail?: string;
  isRestoreFundFlow?: boolean;
  nonOrdinalUtxos?: BtcUtxoDataResponse [];
  onConfirmClick: (signedTxHex: string) => void;
  onCancelClick: () => void;
  onBackButtonClick: () => void;
}

function ConfirmBtcTransactionComponent({
  fee,
  loadingBroadcastedTx,
  signedTxHex,
  ordinalTxUtxo,
  recipients,
  children,
  assetDetail,
  isRestoreFundFlow,
  nonOrdinalUtxos,
  onConfirmClick,
  onCancelClick,
  onBackButtonClick,
}: Props) {
  const { t } = useTranslation('translation');
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const [loading, setLoading] = useState(false);
  const [openTransactionSettingModal, setOpenTransactionSettingModal] = useState(false);
  const {
    btcAddress, selectedAccount, seedPhrase, network, btcFiatRate,
  } = useSelector(
    (state: StoreState) => state.walletState,
  );
  const [currentFee, setCurrentFee] = useState(fee);
  const [error, setError] = useState('');
  const [signedTx, setSignedTx] = useState(signedTxHex);
  const {
    isLoading,
    data,
    error: txError,
    mutate,
  } = useMutation<
  SignedBtcTx,
  ResponseError,
  {
    recipients: Recipient[];
    txFee: string;
  }
  >(async ({ recipients, txFee }) => signBtcTransaction(
    recipients,
    btcAddress,
    selectedAccount?.id ?? 0,
    seedPhrase,
    network.type,
    new BigNumber(txFee),
  ));

  const {
    isLoading: isLoadingNonOrdinalBtcSend,
    error: errorSigningNonOrdial,
    data: signedNonOrdinalBtcSend,
    mutate: mutateSignNonOrdinalBtcTransaction,
  } = useMutation<SignedBtcTx, ResponseError, string>(async (txFee) => {
    const signedNonOrdinalBtcTx = await signNonOrdinalBtcSendTransaction(
      btcAddress,
      nonOrdinalUtxos!,
      selectedAccount?.id ?? 0,
      seedPhrase,
      network.type,
      new BigNumber(txFee),
    );
    return signedNonOrdinalBtcTx;
  });

  const {
    isLoading: isLoadingOrdData,
    data: ordinalData,
    error: ordinalError,
    mutate: ordinalMutate,
  } = useMutation<SignedBtcTx, ResponseError, string>(async (txFee) => {
    const signedTx = await signOrdinalSendTransaction(
      recipients[0]?.address,
      ordinalTxUtxo!,
      btcAddress,
      Number(selectedAccount?.id),
      seedPhrase,
      network.type,
      new BigNumber(txFee),
    );
    return signedTx;
  });

  useEffect(() => {
    if (data) {
      setCurrentFee(data.fee);
      setSignedTx(data.signedTx);
      setOpenTransactionSettingModal(false);
    }
  }, [data]);

  useEffect(() => {
    if (ordinalData) {
      setCurrentFee(ordinalData.fee);
      setSignedTx(ordinalData.signedTx);
      setOpenTransactionSettingModal(false);
    }
  }, [ordinalData]);

  useEffect(() => {
    if (signedNonOrdinalBtcSend) {
      setCurrentFee(signedNonOrdinalBtcSend.fee);
      setSignedTx(signedNonOrdinalBtcSend.signedTx);
      setOpenTransactionSettingModal(false);
    }
  }, [signedNonOrdinalBtcSend]);

  const onAdvancedSettingClick = () => {
    setOpenTransactionSettingModal(true);
  };

  const closeTransactionSettingAlert = () => {
    setOpenTransactionSettingModal(false);
  };

  const onApplyClick = (modifiedFee: string) => {
    setCurrentFee(new BigNumber(modifiedFee));
    if (ordinalTxUtxo) ordinalMutate(modifiedFee);
    else if (isRestoreFundFlow) {
      mutateSignNonOrdinalBtcTransaction(modifiedFee);
    } else {
      mutate({ recipients, txFee: modifiedFee });
    }
    setLoading(true);
  };

  const handleOnConfirmClick = () => {
    onConfirmClick(signedTx);
  };

  useEffect(() => {
    if (recipients && txError) {
      setOpenTransactionSettingModal(false);
      if (Number(txError) === ErrorCodes.InSufficientBalance) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE'));
      } else if (Number(txError) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE_FEES'));
      } else setError(txError.toString());
    }
  }, [txError]);

  useEffect(() => {
    if (recipients && ordinalError) {
      setOpenTransactionSettingModal(false);
      if (Number(txError) === ErrorCodes.InSufficientBalance) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE'));
      } else if (Number(txError) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE_FEES'));
      } else setError(ordinalError.toString());
    }
  }, [ordinalError]);

  useEffect(() => {
    if (recipients && errorSigningNonOrdial) {
      setOpenTransactionSettingModal(false);
      if (Number(txError) === ErrorCodes.InSufficientBalance) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE'));
      } else if (Number(txError) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE_FEES'));
      } else setError(errorSigningNonOrdial.toString());
    }
  }, [errorSigningNonOrdial]);

  return (
    <OuterContainer>
      {!isGalleryOpen && (
        <TopRow title={t('CONFIRM_TRANSACTION.SEND')} onClick={onBackButtonClick} />
      )}
      <Container>
        {children}
        <ReviewTransactionText isOridnalTx={!!ordinalTxUtxo}>
          {t('CONFIRM_TRANSACTION.REVIEW_TRNSACTION')}
        </ReviewTransactionText>

        {ordinalTxUtxo ? (
          <BtcRecipientComponent
            address={recipients[0]?.address}
            value={assetDetail!}
            icon={AssetIcon}
            title={t('CONFIRM_TRANSACTION.ASSET')}
          />
        ) : (
          recipients?.map((recipient, index) => (
            <BtcRecipientComponent
              recipientIndex={index + 1}
              address={recipient?.address}
              value={satsToBtc(recipient?.amountSats).toString()}
              totalRecipient={recipients?.length}
              icon={IconBitcoin}
              title={t('CONFIRM_TRANSACTION.AMOUNT')}
              subValue={getBtcFiatEquivalent(
                recipient?.amountSats,
                btcFiatRate,
              )}
            />
          ))
        )}

        <TransactionDetailComponent title={t('CONFIRM_TRANSACTION.NETWORK')} value={network.type} />
        <TransactionDetailComponent
          title={t('CONFIRM_TRANSACTION.FEES')}
          value={`${currentFee.toString()} ${t('SATS')}`}
          subValue={getBtcFiatEquivalent(new BigNumber(fee), btcFiatRate)}
        />
        <Button onClick={onAdvancedSettingClick}>
          <>
            <ButtonImage src={SettingIcon} />
            <ButtonText>{t('CONFIRM_TRANSACTION.EDIT_FEES')}</ButtonText>
          </>
        </Button>
        <TransactionSettingAlert
          visible={openTransactionSettingModal}
          fee={currentFee.toString()}
          type={ordinalTxUtxo ? 'Ordinals' : 'BTC'}
          btcRecipients={recipients}
          onApplyClick={onApplyClick}
          onCrossClick={closeTransactionSettingAlert}
          nonOrdinalUtxos={nonOrdinalUtxos}
          loading={loading}
          isRestoreFlow={isRestoreFundFlow}
        />
      </Container>
      <ErrorContainer>
        <ErrorText>{error}</ErrorText>
      </ErrorContainer>
      <ButtonContainer>
        <TransparentButtonContainer>
          <ActionButton
            text={t('CONFIRM_TRANSACTION.CANCEL')}
            transparent
            onPress={onCancelClick}
            disabled={loadingBroadcastedTx || isLoading || isLoadingOrdData || isLoadingNonOrdinalBtcSend}
          />
        </TransparentButtonContainer>
        <ActionButton
          text={t('CONFIRM_TRANSACTION.CONFIRM')}
          disabled={loadingBroadcastedTx || isLoading || isLoadingOrdData || isLoadingNonOrdinalBtcSend}
          processing={loadingBroadcastedTx || isLoading || isLoadingOrdData || isLoadingNonOrdinalBtcSend}
          onPress={handleOnConfirmClick}
        />
      </ButtonContainer>
    </OuterContainer>
  );
}

export default ConfirmBtcTransactionComponent;
