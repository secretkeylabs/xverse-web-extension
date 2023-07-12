import styled from 'styled-components';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getBtcFiatEquivalent, satsToBtc } from '@secretkeylabs/xverse-core/currency';
import { NumericFormat } from 'react-number-format';
import { Recipient, SignedBtcTx, signBtcTransaction } from '@secretkeylabs/xverse-core/transactions/btc';
import { BtcTransactionBroadcastResponse, ResponseError } from '@secretkeylabs/xverse-core/types';
import { parseOrdinalTextContentData } from '@secretkeylabs/xverse-core/api';
import useBtcClient from '@hooks/useBtcClient';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useWalletSelector from '@hooks/useWalletSelector';
import useOrdinalsByAddress from '@hooks/useOrdinalsByAddress';
import InfoContainer from '@components/infoContainer';
import BottomBar from '@components/tabBar';
import TransferFeeView from '@components/transferFeeView';
import AlertMessage from '@components/alertMessage';
import Brc20Tile from '@screens/ordinals/brc20Tile';
import TopRow from '@components/topRow';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import CollapsableContainer from '@screens/signatureRequest/collapsableContainer';
import ActionButton from '@components/button';
import TransactionSettingAlert from '@components/transactionSetting';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import { isLedgerAccount } from '@utils/helper';
import { LedgerTransactionType } from '@screens/ledger/confirmLedgerTransaction';
import { useResetUserFlow } from '@hooks/useResetUserFlow';

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

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
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
  color: props.theme.colors.white['0'],
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
  color: props.theme.colors.white[200],
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
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
  const {
    btcAddress, network, selectedAccount, seedPhrase, btcFiatRate
  } = useWalletSelector();
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

  const { subscribeToResetUserFlow } = useResetUserFlow();
  useEffect(() => subscribeToResetUserFlow('/confirm-inscription-request'), []);

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
  } = useMutation<BtcTransactionBroadcastResponse, Error, { signedTx: string }>({ mutationFn: async ({ signedTx }) => btcClient.sendRawTransaction(signedTx) });

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
  }
  >({ mutationFn: async ({ recipients, txFee }) => signBtcTransaction(
    recipients,
    btcAddress,
    selectedAccount?.id ?? 0,
    seedPhrase,
    network.type,
    new BigNumber(txFee),
  ) });

  const onContinueButtonClick = () => {
    mutate({ signedTx });
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
    } else if (isLedgerAccount(selectedAccount)) {
      const txType: LedgerTransactionType = 'BRC-20';
      navigate('/confirm-ledger-tx', { state: { amount: new BigNumber(amount), recipients: recipient[0], type: txType } });
    } else mutate({ signedTx: signedTxHex });
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

  const onApplyClick = ({
    fee: modifiedFee,
    feeRate,
  }: {
    fee: string;
    feeRate?: string;
    nonce?: string;
  }) => {
    setCurrentFeeRate(new BigNumber(feeRate));
    mutateTxFee({ recipients: recipient, txFee: modifiedFee });
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

      <div style={{ marginBottom: 32 }}>
        <TopRow title={t('CONFIRM_TRANSACTION.SEND')} onClick={goBackToScreen} />
      </div>
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
            <Brc20Tile
              brcContent={textContent}
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
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Icon src={OrdinalsIcon} />
              <TitleText>Ordinal</TitleText>
            </div>
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
        />
        <TransferFeeView
          feePerVByte={currentFeeRate}
          fee={currentFee}
          currency={t('CONFIRM_TRANSACTION.SATS')}
        />
        <TransactionDetailComponent
          title={t('CONFIRM_TRANSACTION.TOTAL')}
          value={getAmountString(satsToBtc(total), t('BTC'))}
          subValue={getBtcFiatEquivalent(total, btcFiatRate)}
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
