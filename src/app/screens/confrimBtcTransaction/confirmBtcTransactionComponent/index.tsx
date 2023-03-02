import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import ActionButton from '@components/button';
import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import TransactionSettingAlert from '@components/transactionSetting';
import { useSelector } from 'react-redux';
import { StoreState } from '@stores/index';
import { signBtcTransaction } from '@secretkeylabs/xverse-core/transactions';
import { useMutation } from '@tanstack/react-query';
import {
  Recipient,
  SignedBtcTx,
  signOrdinalSendTransaction,
} from '@secretkeylabs/xverse-core/transactions/btc';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import {
  btcToSats,
  BtcUtxoDataResponse,
  ErrorCodes,
  getBtcFiatEquivalent,
  ResponseError,
  satsToBtc,
} from '@secretkeylabs/xverse-core';
import TransactionDetailComponent from '../../../components/transactionDetailComponent';
import TransferAmountComponent from '../../../components/transferAmountComponent';
import InputOutputComponent from './inputOutputComponent';

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

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.headline_m,
  color: props.theme.colors.white[0],
  marginBottom: props.theme.spacing(16),
}));

interface Props {
  fee: BigNumber;
  loadingBroadcastedTx: boolean;
  amount: BigNumber;
  recipientAddress: string;
  signedTxHex: string;
  ordinalTxUtxo?: BtcUtxoDataResponse;
  onConfirmClick: (signedTxHex: string) => void;
  onCancelClick: () => void;
  onBackButtonClick: () => void;
}

function ConfirmBtcTransactionComponent({
  fee,
  loadingBroadcastedTx,
  amount,
  recipientAddress,
  signedTxHex,
  ordinalTxUtxo,
  onConfirmClick,
  onCancelClick,
  onBackButtonClick,
}: Props) {
  const { t } = useTranslation('translation');
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const [loading, setLoading] = useState(false);
  const [expandTransferAmountView, setExpandTransferAmountView] = useState(false);
  const [expandInputOutputView, setExpandInputOutputView] = useState(false);
  const [openTransactionSettingModal, setOpenTransactionSettingModal] = useState(false);
  const {
    btcAddress, selectedAccount, seedPhrase, network, btcFiatRate,
  } = useSelector((state: StoreState) => state.walletState);
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
    isLoading: isLoadingOrdData,
    data: ordinalData,
    error: ordinalError,
    mutate: ordinalMutate,
  } = useMutation<SignedBtcTx, ResponseError, string>(async (txFee) => {
    const signedTx = await signOrdinalSendTransaction(
      recipientAddress,
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

  const onAdvancedSettingClick = () => {
    setOpenTransactionSettingModal(true);
  };

  const closeTransactionSettingAlert = () => {
    setOpenTransactionSettingModal(false);
  };

  const onApplyClick = (modifiedFee: string) => {
    setCurrentFee(new BigNumber(modifiedFee));
    const recipients: Recipient[] = [
      {
        address: recipientAddress,
        amountSats: btcToSats(new BigNumber(amount)),
      },
    ];

    if (ordinalTxUtxo) ordinalMutate(modifiedFee);
    else mutate({ recipients, txFee: modifiedFee });
    setLoading(true);
  };

  const handleOnConfirmClick = () => {
    onConfirmClick(signedTx);
  };

  const expandTransferAmountSection = () => {
    setExpandTransferAmountView(!expandTransferAmountView);
  };

  const expandInputOutputSection = () => {
    setExpandInputOutputView(!expandInputOutputView);
  };

  useEffect(() => {
    if (recipientAddress && amount && txError) {
      setOpenTransactionSettingModal(false);
      if (Number(txError) === ErrorCodes.InSufficientBalance) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE'));
      } else if (Number(txError) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE_FEES'));
      } else setError(txError.toString());
    }
  }, [txError]);

  useEffect(() => {
    if (recipientAddress && amount && ordinalError) {
      setOpenTransactionSettingModal(false);
      if (Number(txError) === ErrorCodes.InSufficientBalance) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE'));
      } else if (Number(txError) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE_FEES'));
      } else setError(ordinalError.toString());
    }
  }, [ordinalError]);

  return (
    <OuterContainer>
      {!isGalleryOpen && (
        <TopRow title={t('CONFIRM_TRANSACTION.SEND')} onClick={onBackButtonClick} />
      )}
      <Container>
        <ReviewTransactionText>{t('CONFIRM_TRANSACTION.REVIEW_TRNSACTION')}</ReviewTransactionText>
        {amount && (
          <TransferAmountComponent
            title={t('CONFIRM_TRANSACTION.INDICATION')}
            icon={IconBitcoin}
            value={`${amount.toString()} BTC`}
            subValue={getBtcFiatEquivalent(new BigNumber(fee), btcFiatRate)}
            description="Less than or equal to"
            isExpanded={expandTransferAmountView}
            address={btcAddress}
            onArrowClick={expandTransferAmountSection}
          />
        )}
        <InputOutputComponent
          value={`${amount.toString()} BTC`}
          subValue={getBtcFiatEquivalent(new BigNumber(fee), btcFiatRate)}
          isExpanded={expandInputOutputView}
          address={btcAddress}
          onArrowClick={expandInputOutputSection}
        />
        <TransactionDetailComponent
          title={t('CONFIRM_TRANSACTION.NETWORK')}
          value={network.type}
        />
        <TransactionDetailComponent
          title={t('CONFIRM_TRANSACTION.FEES')}
          value={`${currentFee.toString()} ${t('SATS')}`}
          subValue={getBtcFiatEquivalent(new BigNumber(fee), btcFiatRate)}
        />
        <TransactionDetailComponent
          title={t('CONFIRM_TRANSACTION.TOTAL')}
          subTitle={t('CONFIRM_TRANSACTION.AMOUNT_PLUS_FEES')}
          value={`${satsToBtc(currentFee).plus(amount).toString()} BTC`}
          subValue={getBtcFiatEquivalent(new BigNumber(satsToBtc(currentFee).plus(amount)), btcFiatRate)}
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
          amount={amount}
          onApplyClick={onApplyClick}
          onCrossClick={closeTransactionSettingAlert}
          btcRecepientAddress={recipientAddress}
          ordinalTxUtxo={ordinalTxUtxo}
          loading={loading}
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
            disabled={loadingBroadcastedTx || isLoading || isLoadingOrdData}
          />
        </TransparentButtonContainer>
        <ActionButton
          text={t('CONFIRM_TRANSACTION.CONFIRM')}
          disabled={loadingBroadcastedTx || isLoading || isLoadingOrdData}
          processing={loadingBroadcastedTx || isLoading || isLoadingOrdData}
          onPress={handleOnConfirmClick}
        />
      </ButtonContainer>
    </OuterContainer>
  );
}

export default ConfirmBtcTransactionComponent;
