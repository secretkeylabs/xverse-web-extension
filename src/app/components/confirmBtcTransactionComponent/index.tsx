import AssetIcon from '@assets/img/transactions/Assets.svg';
import RecipientComponent from '@components/recipientComponent';
import TransactionSettingAlert from '@components/transactionSetting';
import TransferFeeView from '@components/transferFeeView';
import useBtcClient from '@hooks/apiClients/useBtcClient';
import useCoinRates from '@hooks/queries/useCoinRates';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import useOrdinalsByAddress from '@hooks/useOrdinalsByAddress';
import useSeedVault from '@hooks/useSeedVault';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { PencilSimple } from '@phosphor-icons/react';
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
import Button from '@ui-library/button';
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

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Subtitle = styled.p`
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_200};
  margin-top: ${(props) => props.theme.space.s};
  margin-bottom: ${(props) => props.theme.space.xs};
`;

const ErrorContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(24),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const ErrorText = styled.p((props) => ({
  ...props.theme.typography.body_s,
  color: props.theme.colors.danger_medium,
}));

const ReviewTransactionText = styled.span<{
  centerAligned: boolean;
}>((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.space.l,
  textAlign: props.centerAligned ? 'center' : 'left',
}));

const CalloutContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(8),
  marginhorizontal: props.theme.spacing(8),
}));

const FeeContainer = styled.div`
  position: relative;
`;

const Label = styled.span`
  ${(props) => props.theme.typography.body_medium_m};
  position: absolute;
  top: 36px;
  left: ${(props) => props.theme.space.m};
  color: ${(props) => props.theme.colors.tangerine};
  transition: color 0.1s ease;
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: ${(props) => props.theme.space.xxs};

  &:hover {
    color: ${(props) => props.theme.colors.tangerine_200};
  }
`;

type Props = {
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
};

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
  const [loading, setLoading] = useState(false);
  const selectedAccount = useSelectedAccount();
  const { btcAddress } = selectedAccount;
  const { network, feeMultipliers } = useWalletSelector();
  const { btcFiatRate } = useCoinRates();
  const { selectedSatBundle } = useNftDataSelector();
  const { getSeed } = useSeedVault();
  const [showFeeSettings, setShowFeeSettings] = useState(false);
  const [error, setError] = useState('');
  const [signedTx, setSignedTx] = useState(signedTxHex);
  const [total, setTotal] = useState<BigNumber>(new BigNumber(0));
  const [showFeeWarning, setShowFeeWarning] = useState(false);
  const btcClient = useBtcClient();

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
        btcClient,
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
        btcClient,
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
    const isFeeHigh =
      feeMultipliers &&
      currentFee.isGreaterThan(new BigNumber(feeMultipliers.thresholdHighSatsFee));
    setShowFeeWarning(!!isFeeHigh);
  }, [currentFee, feeMultipliers]);

  const showEditFeesModal = () => {
    setShowFeeSettings(true);
  };

  const hideEditFeesModal = () => {
    setShowFeeSettings(false);
  };

  const handleApplyClick = async ({
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

  const handleConfirmClick = () => {
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
      <OuterContainer>
        {showFeeWarning && (
          <CalloutContainer>
            <Callout bodyText={t('CONFIRM_TRANSACTION.HIGH_FEE_WARNING_TEXT')} variant="warning" />
          </CalloutContainer>
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
        {currencyType !== 'BTC' && bundle && <SatsBundle bundle={bundle} />}

        <Subtitle>{t('CONFIRM_TRANSACTION.YOU_WILL_SEND')}</Subtitle>

        {ordinalTxUtxo ? (
          <RecipientComponent
            dataTestID="value-text"
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
              dataTestID="value-text"
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

        <Subtitle>{t('CONFIRM_TRANSACTION.TRANSACTION_DETAILS')}</Subtitle>

        <TransactionDetailComponent title={t('CONFIRM_TRANSACTION.NETWORK')} value={network.type} />

        <Subtitle>{t('CONFIRM_TRANSACTION.FEES')}</Subtitle>

        <FeeContainer>
          <TransferFeeView
            feePerVByte={currentFeeRate}
            fee={currentFee}
            currency={t('CONFIRM_TRANSACTION.SATS')}
          />
          <Label onClick={showEditFeesModal}>
            {t('COMMON.EDIT')} <PencilSimple size={16} weight="fill" />
          </Label>
        </FeeContainer>

        {!ordinalTxUtxo && recipients.length > 1 && (
          <TransactionDetailComponent
            title={t('CONFIRM_TRANSACTION.TOTAL')}
            value={getAmountString(satsToBtc(total), t('BTC'))}
            subValue={getBtcFiatEquivalent(total, BigNumber(btcFiatRate))}
            subTitle={t('CONFIRM_TRANSACTION.AMOUNT_PLUS_FEES')}
            titleColor="white_0"
          />
        )}
        <TransactionSettingAlert
          visible={showFeeSettings}
          fee={new BigNumber(currentFee).toString()}
          feePerVByte={feePerVByte}
          type={ordinalTxUtxo ? 'Ordinals' : 'BTC'}
          btcRecipients={recipients}
          ordinalTxUtxo={ordinalTxUtxo}
          onApplyClick={handleApplyClick}
          onCrossClick={hideEditFeesModal}
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
        <Button
          title={t('CONFIRM_TRANSACTION.CANCEL')}
          variant="secondary"
          onClick={onCancelClick}
          disabled={
            loadingBroadcastedTx ||
            isLoading ||
            isLoadingOrdData ||
            isLoadingNonOrdinalBtcSend ||
            ordinalsLoading
          }
        />
        <Button
          title={t('CONFIRM_TRANSACTION.CONFIRM')}
          disabled={
            loadingBroadcastedTx ||
            isLoading ||
            isLoadingOrdData ||
            isLoadingNonOrdinalBtcSend ||
            ordinalsLoading
          }
          loading={
            loadingBroadcastedTx ||
            isLoading ||
            isLoadingOrdData ||
            isLoadingNonOrdinalBtcSend ||
            ordinalsLoading
          }
          onClick={handleConfirmClick}
        />
      </StickyHorizontalSplitButtonContainer>
    </>
  );
}

export default ConfirmBtcTransactionComponent;
