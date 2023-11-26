import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import { ConfirmBrc20TransactionState, LedgerTransactionType } from '@common/types/ledger';
import AlertMessage from '@components/alertMessage';
import ActionButton from '@components/button';
import InfoContainer from '@components/infoContainer';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import TransactionSettingAlert from '@components/transactionSetting';
import TransferFeeView from '@components/transferFeeView';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useBtcClient from '@hooks/useBtcClient';
import useOrdinalsByAddress from '@hooks/useOrdinalsByAddress';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';
import Brc20Tile from '@screens/ordinals/brc20Tile';
import CollapsableContainer from '@screens/signatureRequest/collapsableContainer';
import {
  BtcTransactionBroadcastResponse,
  getBtcFiatEquivalent,
  parseOrdinalTextContentData,
  Recipient,
  ResponseError,
  satsToBtc,
  signBtcTransaction,
  SignedBtcTx,
} from '@secretkeylabs/xverse-core';
import { useMutation } from '@tanstack/react-query';
import { isLedgerAccount } from '@utils/helper';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100%;
  padding-left: 5%;
  padding-right: 5%;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Brc20TileContainer = styled.div({
  width: 112,
  height: 112,
  alignSelf: 'center',
  display: 'flex',
  alignItems: 'center',
});

const TopContainer = styled.div({
  marginBottom: 32,
});

const TransferOrdinalContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(16),
  marginBottom: props.theme.spacing(16),
  textAlign: 'center',
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
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
  marginTop: props.theme.spacing(8),
  marginBottom: props.theme.spacing(8),
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

const DetailRow = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(8),
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_200,
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
}));

const Icon = styled.img((props) => ({
  marginRight: props.theme.spacing(4),
  width: 32,
  height: 32,
  borderRadius: 30,
}));

const BottomBarContainer = styled.h1((props) => ({
  marginTop: props.theme.spacing(5),
}));

function ConfirmInscriptionRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('translation');
  const {
    fee,
    amount,
    signedTxHex,
    recipient,
    isRestoreFundFlow,
    unspentUtxos,
    brcContent,
    feePerVByte,
  } = location.state;
  const { btcAddress, network, selectedAccount, btcFiatRate } = useWalletSelector();
  const { getSeed } = useSeedVault();
  const btcClient = useBtcClient();
  const [signedTx, setSignedTx] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [showOrdinalsDetectedAlert, setShowOrdinalsDetectedAlert] = useState(false);
  const [currentFee, setCurrentFee] = useState(fee);
  const [total, setTotal] = useState<BigNumber>(new BigNumber(0));
  const [currentFeeRate, setCurrentFeeRate] = useState(feePerVByte);
  const [showFeeSettings, setShowFeeSettings] = useState(false);
  const { refetch } = useBtcWalletData();
  const { ordinals: ordinalsInBtc } = useOrdinalsByAddress(btcAddress);

  const content = useMemo(() => textContent && JSON.parse(textContent), [textContent]);

  useResetUserFlow('/confirm-inscription-request');

  useEffect(() => {
    axios
      .get<string>(brcContent, {
        timeout: 30000,
        transformResponse: [(data) => parseOrdinalTextContentData(data)],
      })
      .then((response) => setTextContent(response!.data))
      .catch((error) => '');
    return () => {
      setTextContent('');
    };
  }, [brcContent]);

  const {
    isLoading,
    error: txError,
    data: btcTxBroadcastData,
    mutate,
  } = useMutation<BtcTransactionBroadcastResponse, Error, { txToBeBroadcasted: string }>({
    mutationFn: async ({ txToBeBroadcasted }) => btcClient.sendRawTransaction(txToBeBroadcasted),
  });

  const {
    isLoading: loadingFee,
    data,
    error: txFeeError,
    mutate: mutateTxFee,
  } = useMutation<
    SignedBtcTx,
    ResponseError,
    {
      recipients: Recipient[];
      txFee: string;
      seedPhrase: string;
    }
  >({
    mutationFn: async ({ recipients, txFee, seedPhrase }) =>
      signBtcTransaction(
        recipients,
        btcAddress,
        selectedAccount?.id ?? 0,
        seedPhrase,
        network.type,
        new BigNumber(txFee),
      ),
  });

  const onContinueButtonClick = () => {
    mutate({ txToBeBroadcasted: signedTx });
  };

  const onClick = () => {
    navigate('/recover-ordinals');
  };

  useEffect(() => {
    if (data) {
      setCurrentFee(data.fee);
      setSignedTx(data.signedTx);
      setShowFeeSettings(false);
    }
  }, [data]);

  useEffect(() => {
    const totalAmount: BigNumber = new BigNumber(0);
    let sum: BigNumber = new BigNumber(0);
    if (recipient) {
      recipient.map((r) => {
        sum = totalAmount.plus(r.amountSats);
        return sum;
      });
      sum = sum?.plus(currentFee);
    }
    setTotal(sum);
  }, [recipient, currentFee]);

  useEffect(() => {
    if (btcTxBroadcastData) {
      navigate('/tx-status', {
        state: {
          txid: btcTxBroadcastData.tx.hash,
          currency: 'BTC',
          error: '',
          isBrc20TokenFlow: true,
        },
      });
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  }, [btcTxBroadcastData]);

  useEffect(() => {
    if (txError) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: txError.toString(),
        },
      });
    }
  }, [txError]);

  const handleOnConfirmClick = () => {
    if (ordinalsInBtc && ordinalsInBtc.length > 0) {
      setSignedTx(signedTxHex);
      setShowOrdinalsDetectedAlert(true);
      return;
    }

    if (isLedgerAccount(selectedAccount)) {
      const txType: LedgerTransactionType = 'BRC-20';
      const state: ConfirmBrc20TransactionState = {
        amount: new BigNumber(amount),
        recipients: recipient,
        type: txType,
        fee,
      };

      navigate('/confirm-ledger-tx', { state });
      return;
    }

    mutate({ txToBeBroadcasted: signedTxHex });
  };

  const goBackToScreen = () => {
    navigate(-1);
  };

  const onClosePress = () => {
    setShowOrdinalsDetectedAlert(false);
  };

  const onAdvancedSettingClick = () => {
    setShowFeeSettings(true);
  };

  const onApplyClick = async ({
    fee: modifiedFee,
    feeRate,
  }: {
    fee: string;
    feeRate?: string;
    nonce?: string;
  }) => {
    const seedPhrase = await getSeed();
    setCurrentFeeRate(new BigNumber(feeRate!));
    mutateTxFee({ recipients: recipient, txFee: modifiedFee, seedPhrase });
  };

  const closeTransactionSettingAlert = () => {
    setShowFeeSettings(false);
  };

  const getAmountString = (amountTotal: BigNumber, currency: string) => (
    <NumericFormat
      value={amountTotal.toString()}
      displayType="text"
      thousandSeparator
      suffix={` ${currency}`}
    />
  );
  return (
    <>
      {showOrdinalsDetectedAlert && (
        <AlertMessage
          title={t('CONFIRM_TRANSACTION.BTC_TRANSFER_DANGER_ALERT_TITLE')}
          description={t('CONFIRM_TRANSACTION.BTC_TRANSFER_DANGER_ALERT_DESC')}
          buttonText={t('CONFIRM_TRANSACTION.BACK')}
          onClose={onClosePress}
          secondButtonText={t('CONITNUE')}
          onButtonClick={onClosePress}
          onSecondButtonClick={onContinueButtonClick}
          isWarningAlert
        />
      )}

      <TopContainer>
        <TopRow title={t('CONFIRM_TRANSACTION.SEND')} onClick={goBackToScreen} />
      </TopContainer>
      {ordinalsInBtc && ordinalsInBtc.length > 0 && (
        <InfoContainer
          type="Warning"
          showWarningBackground
          bodyText={t('CONFIRM_TRANSACTION.ORDINAL_DETECTED_WARNING')}
          redirectText={t('CONFIRM_TRANSACTION.ORDINAL_DETECTED_ACTION')}
          onClick={onClick}
        />
      )}
      <OuterContainer>
        {textContent && (
          <Brc20TileContainer>
            {/* TODO fix type error */}
            <Brc20Tile
              brcContent={textContent as any}
              isGalleryOpen={false}
              isNftDashboard={false}
              inNftDetail={false}
              isSmallImage={false}
              withoutSizeIncrease
            />
          </Brc20TileContainer>
        )}
        <ReviewTransactionText>Inscribe Transfer Ordinal</ReviewTransactionText>
        <CollapsableContainer title="You will inscribe" text="" initialValue>
          <DetailRow>
            <TransferOrdinalContainer>
              <Icon src={OrdinalsIcon} />
              <TitleText>Ordinal</TitleText>
            </TransferOrdinalContainer>
            <ValueText>BRC-20 Transfer</ValueText>
          </DetailRow>
          <DetailRow>
            <TitleText>Transfer</TitleText>
            <ValueText>{getAmountString(new BigNumber(content.amt), content.tick)}</ValueText>
          </DetailRow>
        </CollapsableContainer>
        <TransactionDetailComponent title={t('CONFIRM_TRANSACTION.NETWORK')} value={network.type} />
        <TransactionDetailComponent
          title="Inscription Service Fee"
          value={getAmountString(satsToBtc(new BigNumber(amount)), t('BTC'))}
          subValue={getBtcFiatEquivalent(new BigNumber(amount), BigNumber(btcFiatRate))}
        />
        <TransferFeeView
          feePerVByte={currentFeeRate}
          fee={currentFee}
          currency={t('CONFIRM_TRANSACTION.SATS')}
        />
        <TransactionDetailComponent
          title={t('CONFIRM_TRANSACTION.TOTAL')}
          value={getAmountString(satsToBtc(total), t('BTC'))}
          subValue={getBtcFiatEquivalent(total, BigNumber(btcFiatRate))}
          subTitle={t('CONFIRM_TRANSACTION.AMOUNT_PLUS_FEES')}
        />
        <Button onClick={onAdvancedSettingClick}>
          <>
            <ButtonImage src={SettingIcon} />
            <ButtonText>{t('CONFIRM_TRANSACTION.EDIT_FEES')}</ButtonText>
          </>
        </Button>
        <ButtonContainer>
          <TransparentButtonContainer>
            <ActionButton
              text={t('CONFIRM_TRANSACTION.CANCEL')}
              transparent
              onPress={goBackToScreen}
              disabled={isLoading || loadingFee}
            />
          </TransparentButtonContainer>
          <ActionButton
            text={t('CONFIRM_TRANSACTION.CONFIRM')}
            disabled={isLoading || loadingFee}
            processing={isLoading || loadingFee}
            onPress={handleOnConfirmClick}
          />
        </ButtonContainer>
        <TransactionSettingAlert
          visible={showFeeSettings}
          fee={new BigNumber(currentFee).toString()}
          type="BTC"
          btcRecipients={recipient}
          onApplyClick={onApplyClick}
          onCrossClick={closeTransactionSettingAlert}
          nonOrdinalUtxos={unspentUtxos}
          loading={loadingFee}
          isRestoreFlow={isRestoreFundFlow}
          feePerVByte={feePerVByte}
          showFeeSettings={showFeeSettings}
          setShowFeeSettings={setShowFeeSettings}
        />
      </OuterContainer>
      <BottomBarContainer>
        <BottomBar tab="dashboard" />
      </BottomBarContainer>
    </>
  );
}

export default ConfirmInscriptionRequest;
