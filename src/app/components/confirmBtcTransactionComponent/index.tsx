import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import AssetIcon from '@assets/img/transactions/Assets.svg';
import ActionButton from '@components/button';
import InfoContainer from '@components/infoContainer';
import RecipientComponent from '@components/recipientComponent';
import TransactionSettingAlert from '@components/transactionSetting';
import TransferFeeView from '@components/transferFeeView';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import useOrdinalsByAddress from '@hooks/useOrdinalsByAddress';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  Bundle,
  ErrorCodes,
  getBtcFiatEquivalent,
  Recipient,
  ResponseError,
  satsToBtc,
  signBtcTransaction,
  SignedBtcTx,
  signNonOrdinalBtcSendTransaction,
  signOrdinalSendTransaction,
  UTXO,
} from '@secretkeylabs/xverse-core';
import { useMutation } from '@tanstack/react-query';
import Callout from '@ui-library/callout';
import { StickyHorizontalSplitButtonContainer } from '@ui-library/common.styled';
import { CurrencyTypes } from '@utils/constants';
import BigNumber from 'bignumber.js';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import TransactionDetailComponent from '../transactionDetailComponent';
import SatsBundle from './bundle';

interface MainContainerProps {
  isGalleryOpen: boolean;
}

const OuterContainer = styled.div<MainContainerProps>`
  display: flex;
  flex-direction: column;
`;

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  width: '100%',
  marginTop: props.theme.spacing(10),
  marginBottom: props.theme.space.m,
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
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
  ...props.theme.typography.body_s,
  color: props.theme.colors.danger_medium,
}));

interface ReviewTransactionTitleProps {
  centerAligned: boolean;
}
const ReviewTransactionText = styled.h1<ReviewTransactionTitleProps>((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(16),
  textAlign: props.centerAligned ? 'center' : 'left',
}));

const CalloutContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(8),
  marginhorizontal: props.theme.spacing(8),
}));

interface Props {
  currentFee: BigNumber;
  feePerVByte: BigNumber; // TODO tim: is this the same as currentFeeRate? refactor to be clear
  loadingBroadcastedTx: boolean;
  signedTxHex: string;
  ordinalTxUtxo?: UTXO;
  recipients: Recipient[];
  children?: ReactNode;
  assetDetail?: string;
  assetDetailValue?: string;
  isRestoreFundFlow?: boolean;
  nonOrdinalUtxos?: UTXO[];
  currencyType?: CurrencyTypes;
  isPartOfBundle?: boolean;
  ordinalBundle?: Bundle;
  holdsRareSats?: boolean;
  currentFeeRate: BigNumber;
  setCurrentFee: (feeRate: BigNumber) => void;
  setCurrentFeeRate: (feeRate: BigNumber) => void;
  onConfirmClick: (signedTxHex: string) => void;
  onCancelClick: () => void;
}

function ConfirmBtcTransactionComponent({
  currentFee,
  feePerVByte,
  loadingBroadcastedTx,
  signedTxHex,
  ordinalTxUtxo,
  recipients,
  children,
  assetDetail,
  assetDetailValue,
  isRestoreFundFlow,
  nonOrdinalUtxos,
  isPartOfBundle,
  currencyType,
  ordinalBundle,
  holdsRareSats,
  currentFeeRate,
  setCurrentFee,
  setCurrentFeeRate,
  onConfirmClick,
  onCancelClick,
}: Props) {
  const { t } = useTranslation('translation');
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const [loading, setLoading] = useState(false);
  const { btcAddress, selectedAccount, network, btcFiatRate, feeMultipliers } = useWalletSelector();
  const { selectedSatBundle } = useNftDataSelector();
  const { getSeed } = useSeedVault();
  const [showFeeSettings, setShowFeeSettings] = useState(false);
  const [error, setError] = useState('');
  const [signedTx, setSignedTx] = useState(signedTxHex);
  const [total, setTotal] = useState<BigNumber>(new BigNumber(0));
  const [showFeeWarning, setShowFeeWarning] = useState(false);

  const bundle = selectedSatBundle ?? ordinalBundle ?? undefined;
  const {
    isLoading,
    data,
    error: txError,
    mutate,
  } = useMutation<
    SignedBtcTx,
    ResponseError,
    {
      txRecipients: Recipient[];
      txFee: string;
      seedPhrase: string;
    }
  >({
    mutationFn: async ({ txRecipients: newRecipients, txFee, seedPhrase }) =>
      signBtcTransaction(
        newRecipients,
        btcAddress,
        selectedAccount?.id ?? 0,
        seedPhrase,
        network.type,
        new BigNumber(txFee),
      ),
  });

  if (typeof feePerVByte !== 'string' && !BigNumber.isBigNumber(feePerVByte)) {
    Object.setPrototypeOf(feePerVByte, BigNumber.prototype);
  }

  recipients.forEach((recipient) => {
    if (typeof recipient.amountSats !== 'string' && !BigNumber.isBigNumber(recipient.amountSats)) {
      Object.setPrototypeOf(recipient.amountSats, BigNumber.prototype);
    }
  });

  const {
    isLoading: isLoadingNonOrdinalBtcSend,
    error: errorSigningNonOrdial,
    data: signedNonOrdinalBtcSend,
    mutate: mutateSignNonOrdinalBtcTransaction,
  } = useMutation<SignedBtcTx, ResponseError, { txFee: string; seedPhrase: string }>({
    mutationFn: async ({ txFee, seedPhrase }) => {
      const signedNonOrdinalBtcTx = await signNonOrdinalBtcSendTransaction(
        btcAddress,
        nonOrdinalUtxos!,
        selectedAccount?.id ?? 0,
        seedPhrase,
        network.type,
        new BigNumber(txFee),
      );
      return signedNonOrdinalBtcTx;
    },
  });

  const { ordinals, isLoading: ordinalsLoading } = useOrdinalsByAddress(btcAddress);

  const {
    isLoading: isLoadingOrdData,
    data: ordinalData,
    error: ordinalError,
    mutate: ordinalMutate,
  } = useMutation<SignedBtcTx, ResponseError, { txFee: string; seedPhrase: string }>({
    mutationFn: async ({ txFee, seedPhrase }) => {
      const ordinalsUtxos = ordinals!.map((ord) => ord.utxo);

      const newSignedTx = await signOrdinalSendTransaction(
        recipients[0]?.address,
        ordinalTxUtxo!,
        btcAddress,
        Number(selectedAccount?.id),
        seedPhrase,
        network.type,
        ordinalsUtxos,
        new BigNumber(txFee),
      );
      return newSignedTx;
    },
  });

  useEffect(() => {
    if (data) {
      setCurrentFee(data.fee);
      setSignedTx(data.signedTx);
      setShowFeeSettings(false);
    }
  }, [data]);

  useEffect(() => {
    if (ordinalData) {
      setCurrentFee(ordinalData.fee);
      setSignedTx(ordinalData.signedTx);
      setShowFeeSettings(false);
    }
  }, [ordinalData]);

  useEffect(() => {
    let sum: BigNumber = new BigNumber(0);
    if (recipients?.length) {
      recipients.forEach((recipient) => {
        sum = sum.plus(recipient.amountSats);
      });
      sum = sum?.plus(currentFee);
    }
    setTotal(sum);
  }, [recipients, currentFee]);

  useEffect(() => {
    if (signedNonOrdinalBtcSend) {
      setCurrentFee(signedNonOrdinalBtcSend.fee);
      setSignedTx(signedNonOrdinalBtcSend.signedTx);
      setShowFeeSettings(false);
    }
  }, [signedNonOrdinalBtcSend]);

  useEffect(() => {
    if (
      feeMultipliers &&
      currentFee.isGreaterThan(new BigNumber(feeMultipliers.thresholdHighSatsFee))
    ) {
      setShowFeeWarning(true);
    } else if (showFeeWarning) {
      setShowFeeWarning(false);
    }
  }, [currentFee, feeMultipliers]);

  const onAdvancedSettingClick = () => {
    setShowFeeSettings(true);
  };

  const closeTransactionSettingAlert = () => {
    setShowFeeSettings(false);
  };

  const onApplyClick = async ({
    fee: modifiedFee,
    feeRate,
  }: {
    fee: string;
    feeRate?: string;
    nonce?: string;
  }) => {
    const newFee = new BigNumber(modifiedFee);
    setCurrentFee(newFee);
    const seed = await getSeed();
    setCurrentFeeRate(new BigNumber(feeRate!));
    if (ordinalTxUtxo) ordinalMutate({ txFee: modifiedFee, seedPhrase: seed });
    else if (isRestoreFundFlow) {
      mutateSignNonOrdinalBtcTransaction({ txFee: modifiedFee, seedPhrase: seed });
    } else {
      mutate({ txRecipients: recipients, txFee: modifiedFee, seedPhrase: seed });
    }
    setLoading(true);
  };

  const handleOnConfirmClick = () => {
    onConfirmClick(signedTx);
  };

  const getAmountString = (amount: BigNumber, currency: string) => (
    <NumericFormat
      value={amount.toString()}
      displayType="text"
      thousandSeparator
      suffix={` ${currency}`}
    />
  );

  useEffect(() => {
    if (recipients && txError) {
      setShowFeeSettings(false);
      if (Number(txError) === ErrorCodes.InSufficientBalance) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE'));
      } else if (Number(txError) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE_FEES'));
      } else setError(txError.toString());
    }
  }, [txError]);

  useEffect(() => {
    if (recipients && ordinalError) {
      setShowFeeSettings(false);
      if (Number(txError) === ErrorCodes.InSufficientBalance) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE'));
      } else if (Number(txError) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE_FEES'));
      } else setError(ordinalError.toString());
    }
  }, [ordinalError]);

  useEffect(() => {
    if (recipients && errorSigningNonOrdial) {
      setShowFeeSettings(false);
      if (Number(txError) === ErrorCodes.InSufficientBalance) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE'));
      } else if (Number(txError) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE_FEES'));
      } else setError(errorSigningNonOrdial.toString());
    }
  }, [errorSigningNonOrdial]);

  return (
    <>
      <OuterContainer isGalleryOpen={isGalleryOpen}>
        {showFeeWarning && (
          <InfoContainer type="Warning" bodyText={t('CONFIRM_TRANSACTION.HIGH_FEE_WARNING_TEXT')} />
        )}
        {/* TODO tim: refactor this not to use children. it should be just another prop */}
        {children}
        <ReviewTransactionText centerAligned={currencyType === 'Ordinal'}>
          {t('CONFIRM_TRANSACTION.REVIEW_TRANSACTION')}
        </ReviewTransactionText>
        {isPartOfBundle && (
          <CalloutContainer>
            <Callout bodyText={t('NFT_DASHBOARD_SCREEN.FROM_RARE_SAT_BUNDLE')} variant="warning" />
          </CalloutContainer>
        )}
        {holdsRareSats && (
          <CalloutContainer>
            <Callout bodyText={t('NFT_DASHBOARD_SCREEN.HOLDS_RARE_SAT')} variant="warning" />
          </CalloutContainer>
        )}
        {bundle && <SatsBundle bundle={bundle} />}
        {ordinalTxUtxo ? (
          <RecipientComponent
            address={recipients[0]?.address}
            value={assetDetail ?? ''}
            valueDetail={assetDetailValue}
            icon={AssetIcon}
            currencyType={currencyType || 'Ordinal'}
            title={t('CONFIRM_TRANSACTION.ASSET')}
          />
        ) : (
          recipients?.map((recipient, index) => (
            <RecipientComponent
              key={recipient.address}
              recipientIndex={index + 1}
              address={recipient.address}
              value={satsToBtc(recipient.amountSats).toString()}
              totalRecipient={recipients.length}
              currencyType="BTC"
              title={t('CONFIRM_TRANSACTION.AMOUNT')}
              showSenderAddress={isRestoreFundFlow}
            />
          ))
        )}
        <TransactionDetailComponent title={t('CONFIRM_TRANSACTION.NETWORK')} value={network.type} />
        <TransferFeeView
          feePerVByte={currentFeeRate}
          fee={currentFee}
          currency={t('CONFIRM_TRANSACTION.SATS')}
        />
        {!ordinalTxUtxo && (
          <TransactionDetailComponent
            title={t('CONFIRM_TRANSACTION.TOTAL')}
            value={getAmountString(satsToBtc(total), t('BTC'))}
            subValue={getBtcFiatEquivalent(total, BigNumber(btcFiatRate))}
            subTitle={t('CONFIRM_TRANSACTION.AMOUNT_PLUS_FEES')}
          />
        )}
        <Button onClick={onAdvancedSettingClick}>
          <ButtonImage src={SettingIcon} />
          <ButtonText>{t('CONFIRM_TRANSACTION.EDIT_FEES')}</ButtonText>
        </Button>
        <TransactionSettingAlert
          visible={showFeeSettings}
          fee={new BigNumber(currentFee).toString()}
          feePerVByte={feePerVByte}
          type={ordinalTxUtxo ? 'Ordinals' : 'BTC'}
          btcRecipients={recipients}
          ordinalTxUtxo={ordinalTxUtxo}
          onApplyClick={onApplyClick}
          onCrossClick={closeTransactionSettingAlert}
          nonOrdinalUtxos={nonOrdinalUtxos}
          loading={loading || ordinalsLoading}
          isRestoreFlow={isRestoreFundFlow}
          showFeeSettings={showFeeSettings}
          setShowFeeSettings={setShowFeeSettings}
        />
        {!!error && (
          <ErrorContainer>
            <ErrorText>{error}</ErrorText>
          </ErrorContainer>
        )}
      </OuterContainer>
      <StickyHorizontalSplitButtonContainer>
        <ActionButton
          text={t('CONFIRM_TRANSACTION.CANCEL')}
          transparent
          onPress={onCancelClick}
          disabled={
            loadingBroadcastedTx ||
            isLoading ||
            isLoadingOrdData ||
            isLoadingNonOrdinalBtcSend ||
            ordinalsLoading
          }
        />
        <ActionButton
          text={t('CONFIRM_TRANSACTION.CONFIRM')}
          disabled={
            loadingBroadcastedTx ||
            isLoading ||
            isLoadingOrdData ||
            isLoadingNonOrdinalBtcSend ||
            ordinalsLoading
          }
          processing={
            loadingBroadcastedTx ||
            isLoading ||
            isLoadingOrdData ||
            isLoadingNonOrdinalBtcSend ||
            ordinalsLoading
          }
          onPress={handleOnConfirmClick}
        />
      </StickyHorizontalSplitButtonContainer>
    </>
  );
}

export default ConfirmBtcTransactionComponent;
