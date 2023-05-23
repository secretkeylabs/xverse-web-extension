import { useNavigate, useLocation } from 'react-router-dom';
import {
  useEffect, useState,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import { BtcTransactionBroadcastResponse, ResponseError } from '@secretkeylabs/xverse-core/types';
import BottomBar from '@components/tabBar';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useWalletSelector from '@hooks/useWalletSelector';
import styled from 'styled-components';
import InfoContainer from '@components/infoContainer';
import { useTranslation } from 'react-i18next';
import useOrdinalsByAddress from '@hooks/useOrdinalsByAddress';
import useNonOrdinalUtxos from '@hooks/useNonOrdinalUtxo';
import AlertMessage from '@components/alertMessage';
import { Recipient, SignedBtcTx, signBtcTransaction } from '@secretkeylabs/xverse-core/transactions/btc';
import useBtcClient from '@hooks/useBtcClient';
import Brc20Tile from '@screens/ordinals/brc20Tile';
import axios from 'axios';
import { parseOrdinalTextContentData } from '@secretkeylabs/xverse-core/api';
import TopRow from '@components/topRow';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import CollapsableContainer from '@screens/signatureRequest/collapsableContainer';
import RecipientComponent from '@components/recipientComponent';
import AssetIcon from '@assets/img/transactions/Assets.svg';
import ActionButton from '@components/button';
import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import TransactionSettingAlert from '@components/transactionSetting';
import BigNumber from 'bignumber.js';

const BottomBarContainer = styled.h1((props) => ({
  marginTop: props.theme.spacing(5),
}));

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

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white[0],
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

function ConfirmInscriptionRequest() {
  const navigate = useNavigate();
  const { t } = useTranslation('translation');
  const {
    btcAddress, network, selectedAccount, seedPhrase,
  } = useWalletSelector();
  const btcClient = useBtcClient();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [signedTx, setSignedTx] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [showOrdinalsDetectedAlert, setShowOrdinalsDetectedAlert] = useState(false);
  const location = useLocation();
  const { refetch } = useBtcWalletData();
  const { ordinals: ordinalsInBtc } = useOrdinalsByAddress(btcAddress);
  const { unspentUtxos: withdrawOridnalsUtxos } = useNonOrdinalUtxos();
  const {
    fee, amount, signedTxHex, recipient, isRestoreFundFlow, unspentUtxos, brcContent,
  } = location.state;
  const [openTransactionSettingModal, setOpenTransactionSettingModal] = useState(false);
  const [currentFee, setCurrentFee] = useState(fee);

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
  } = useMutation<BtcTransactionBroadcastResponse, Error, { signedTx: string }>(
    async ({ signedTx }) => btcClient.sendRawTransaction(signedTx),
  );

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
  >(async ({ recipients, txFee }) => signBtcTransaction(
    recipients,
    btcAddress,
    selectedAccount?.id ?? 0,
    seedPhrase,
    network.type,
    new BigNumber(txFee),
  ));

  const onContinueButtonClick = () => {
    mutate({ signedTx });
  };

  const onClick = () => {
    navigate('/recover-ordinals');
  };

  useEffect(() => {
    setRecipientAddress(location.state.recipientAddress);
  }, [location]);

  useEffect(() => {
    if (btcTxBroadcastData) {
      navigate('/tx-status', {
        state: {
          txid: btcTxBroadcastData.tx.hash,
          currency: 'BTC',
          error: '',
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
    } else mutate({ signedTx: signedTxHex });
  };

  const goBackToScreen = () => {
    navigate(-1);
  };

  const onClosePress = () => {
    setShowOrdinalsDetectedAlert(false);
  };

  const onAdvancedSettingClick = () => {
    setOpenTransactionSettingModal(true);
  };

  const onApplyClick = (modifiedFee: string) => {
    setCurrentFee(new BigNumber(modifiedFee));
    mutateTxFee({ recipients: [recipient], txFee: modifiedFee });
  };

  const closeTransactionSettingAlert = () => {
    setOpenTransactionSettingModal(false);
  };

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
      {ordinalsInBtc && ordinalsInBtc.length > 0 && (
        <InfoContainer
          type="Warning"
          showWarningBackground
          bodyText={t('CONFIRM_TRANSACTION.ORDINAL_DETECTED_WARNING')}
          redirectText={t('CONFIRM_TRANSACTION.ORDINAL_DETECTED_ACTION')}
          onClick={onClick}
        />
      )}
      <div style={{ marginBottom: 16 }}>
        <TopRow title={t('CONFIRM_TRANSACTION.SEND')} onClick={goBackToScreen} />
      </div>
      <OuterContainer>
        {textContent && (
          <div
            style={{
              width: 112,
              height: 112,
              alignSelf: 'center',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Brc20Tile
              brcContent={textContent}
              isGalleryOpen={false}
              isNftDashboard={false}
              inNftDetail
              isSmallImage={false}
            />
          </div>
        )}
        <ReviewTransactionText>{t('CONFIRM_TRANSACTION.REVIEW_TRNSACTION')}</ReviewTransactionText>
        <RecipientComponent
          address={recipientAddress}
          value={textContent!}
          icon={AssetIcon}
          currencyType="Ordinal"
          title={t('CONFIRM_TRANSACTION.ASSET')}
        />
        <TransactionDetailComponent title={t('CONFIRM_TRANSACTION.NETWORK')} value={network.type} />
        <TransactionDetailComponent title="Bitcoin Value" value={amount} />
        <CollapsableContainer title="Fees" text="">
          <TransactionDetailComponent title="Inscription fee" value={amount} />
          <TransactionDetailComponent title="Transaction fee" value={amount} />
          <TransactionDetailComponent title="Total fee" value={amount} />
        </CollapsableContainer>
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
        {/* <ConfirmBtcTransactionComponent
          fee={fee}
          recipients={recipient as Recipient[]}
          loadingBroadcastedTx={isLoading}
          signedTxHex={signedTxHex}
          isRestoreFundFlow={isRestoreFundFlow}
          onConfirmClick={handleOnConfirmClick}
          onCancelClick={goBackToScreen}
          onBackButtonClick={goBackToScreen}
          nonOrdinalUtxos={unspentUtxos}
          amount={amount}
        /> */}
        <TransactionSettingAlert
          visible={openTransactionSettingModal}
          fee={new BigNumber(currentFee).toString()}
          type="BTC"
          btcRecipients={[recipient]}
          onApplyClick={onApplyClick}
          onCrossClick={closeTransactionSettingAlert}
          nonOrdinalUtxos={unspentUtxos}
          loading={loadingFee}
          isRestoreFlow={isRestoreFundFlow}
        />
      </OuterContainer>
      <BottomBarContainer>
        <BottomBar tab="dashboard" />
      </BottomBarContainer>
    </>
  );
}

export default ConfirmInscriptionRequest;
