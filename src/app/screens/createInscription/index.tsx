import BigNumber from 'bignumber.js';
import { decodeToken } from 'jsontokens';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useLocation } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';

import { ExternalSatsMethods, MESSAGE_SOURCE } from '@common/types/message-types';
import { useInscriptionExecute, useInscriptionFees } from '@secretkeylabs/xverse-core';
import { CreateFileInscriptionPayload, CreateTextInscriptionPayload } from 'sats-connect';

import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import WalletIcon from '@assets/img/wallet.svg';
import AccountHeaderComponent from '@components/accountHeader';
import ConfirmScreen from '@components/confirmScreen';
import useBtcClient from '@hooks/useBtcClient';
import useWalletSelector from '@hooks/useWalletSelector';
import { UTXO } from '@secretkeylabs/xverse-core/types';
import { getShortTruncatedAddress } from '@utils/helper';

import CompleteScreen from './CompleteScreen';
import ContentLabel from './ContentLabel';
import EditFee from './EditFee';

const MainContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  flex: 1,
  height: '100%',
}));

const Title = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginTop: props.theme.spacing(11),
  color: props.theme.colors.white[0],
  textAlign: 'left',
}));

const SubTitle = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  marginTop: props.theme.spacing(4),
  color: props.theme.colors.white[400],
  textAlign: 'left',
  marginBottom: props.theme.spacing(12),
}));

const CardContainer = styled.div<{ bottomPadding?: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.background.elevation1,
  borderRadius: 12,
  padding: props.theme.spacing(8),
  paddingBottom: props.bottomPadding ? props.theme.spacing(12) : props.theme.spacing(8),
  justifyContent: 'center',
  marginBottom: props.theme.spacing(6),
  fontSize: 14,
}));

type CardRowProps = {
  topMargin?: boolean;
};
const CardRow = styled.div<CardRowProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: props.topMargin ? props.theme.spacing(8) : 0,
}));

const IconLabel = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
});

const ButtonIcon = styled.img((props) => ({
  width: 32,
  height: 32,
  marginRight: props.theme.spacing(4),
}));

const InfoIconContainer = styled.div((props) => ({
  background: props.theme.colors.background.elevation3,
  width: 32,
  height: 32,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 16,
  marginRight: props.theme.spacing(5),
}));

const InfoIcon = styled.img({
  width: 18,
  height: 18,
});

const MutedLabel = styled.div((props) => ({
  color: props.theme.colors.white[400],
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

const NumberWithSuffixContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  color: props.theme.colors.white[0],
}));

const NumberSuffix = styled.div((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white[400],
}));

type Props = {
  type: 'text' | 'file';
};

function CreateInscription({ type }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'INSCRIPTION_REQUEST' });
  const { search } = useLocation();

  const [payload, requestToken, tabId] = useMemo(() => {
    const params = new URLSearchParams(search);
    const requestEncoded = params.get('createInscription');
    const requestBody = decodeToken(requestEncoded as string);
    return [requestBody.payload as unknown, requestEncoded, Number(params.get('tabId'))];
  }, [search]);

  const [utxos, setUtxos] = useState<UTXO[] | undefined>();
  const [showFeeSettings, setShowFeeSettings] = useState(false);
  const [feeRate, setFeeRate] = useState(20);

  const btcClient = useBtcClient();

  const { ordinalsAddress, network, btcAddress, seedPhrase, selectedAccount, btcFiatRate } =
    useWalletSelector();

  useEffect(() => {
    const fetchUtxos = async () => {
      const btcUtxos = await btcClient.getUnspentUtxos(btcAddress);
      setUtxos(btcUtxos);
    };
    fetchUtxos();
  }, [btcClient, btcAddress]);

  const {
    contentType,
    network: requestedNetwork,
    feeAddress,
    inscriptionFee,
  } = payload as CreateFileInscriptionPayload | CreateTextInscriptionPayload;

  const content =
    type === 'text'
      ? (payload as CreateTextInscriptionPayload).text
      : (payload as CreateFileInscriptionPayload).dataBase64;

  const { commitValue, commitValueBreakdown, errorCode, isInitialised, isLoading, errorMessage } =
    useInscriptionFees({
      addressUtxos: utxos,
      content,
      contentType,
      feeRate,
      revealAddress: ordinalsAddress,
      serviceFee: inscriptionFee,
      serviceFeeAddress: feeAddress,
    });

  const {
    complete,
    errorCode: executeErrorCode,
    executeMint,
    revealTransactionId,
    isExecuting,
  } = useInscriptionExecute({
    addressUtxos: utxos || [],
    accountIndex: selectedAccount!.id,
    changeAddress: btcAddress,
    contentType,
    feeRate,
    network: requestedNetwork.type,
    revealAddress: ordinalsAddress,
    seedPhrase,
    contentBase64: type === 'file' ? content : undefined,
    contentString: type === 'text' ? content : undefined,
  });

  useEffect(() => {
    if (!complete || !revealTransactionId) return;

    const response = {
      source: MESSAGE_SOURCE,
      method:
        type === 'text'
          ? ExternalSatsMethods.createTextInscriptionResponse
          : ExternalSatsMethods.createFileInscriptionResponse,
      payload: {
        createInscriptionRequest: requestToken,
        createInscriptionResponse: {
          txId: revealTransactionId,
        },
      },
    };
    chrome.tabs.sendMessage(tabId, response);
    window.close();
  }, [revealTransactionId, complete, requestToken, tabId, type]);

  const cancelCallback = () => {
    const response = {
      source: MESSAGE_SOURCE,
      method:
        type === 'text'
          ? ExternalSatsMethods.createTextInscriptionResponse
          : ExternalSatsMethods.createFileInscriptionResponse,
      payload: { createInscriptionRequest: requestToken, createInscriptionResponse: 'cancel' },
    };

    chrome.tabs.sendMessage(tabId, response);
    window.close();
  };

  const onAdvancedSettingClick = () => {
    setShowFeeSettings(true);
  };

  const onNewFeeRateSet = (newFeeRate: number) => {
    setFeeRate(newFeeRate);
    setShowFeeSettings(false);
  };

  const serviceFee =
    (commitValueBreakdown?.revealServiceFee ?? 0) + (commitValueBreakdown?.externalServiceFee ?? 0);
  const chainFee =
    (commitValueBreakdown?.revealChainFee ?? 0) + (commitValueBreakdown?.commitChainFee ?? 0);
  const totalFee = serviceFee + chainFee;

  const fiatFees = new BigNumber(totalFee).dividedBy(100e6).multipliedBy(btcFiatRate).toFixed(2);

  if (complete) {
    const onClose = () => {
      const response = {
        source: MESSAGE_SOURCE,
        method:
          type === 'text'
            ? ExternalSatsMethods.createTextInscriptionResponse
            : ExternalSatsMethods.createFileInscriptionResponse,
        payload: {
          createInscriptionRequest: requestToken,
          createInscriptionResponse: {
            txId: revealTransactionId,
          },
        },
      };
      chrome.tabs.sendMessage(tabId, response);
      window.close();
    };

    return <CompleteScreen txId={revealTransactionId!} onClose={onClose} network={network} />;
  }

  return (
    <ConfirmScreen
      onConfirm={executeMint}
      onCancel={cancelCallback}
      cancelText={t('CANCEL_BUTTON')}
      confirmText={t('CONFIRM_BUTTON')}
      loading={!isInitialised || isExecuting || isLoading}
      disabled={!!errorCode || isExecuting}
    >
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      <MainContainer>
        <Title>{t('TITLE')}</Title>
        <SubTitle>{t('SUBTITLE')}</SubTitle>
        <CardContainer bottomPadding>
          <CardRow>
            <div>{t('SUMMARY.TITLE')}</div>
          </CardRow>
          <CardRow topMargin>
            <IconLabel>
              <div>
                <ButtonIcon src={OrdinalsIcon} />
              </div>
              <div>{t('SUMMARY.ORDINAL')}</div>
            </IconLabel>
            <ContentLabel contentType={contentType} content={content} type={type} />
          </CardRow>
          <CardRow topMargin>
            <MutedLabel>{t('SUMMARY.TO')}</MutedLabel>
          </CardRow>
          <CardRow topMargin>
            <IconLabel>
              <InfoIconContainer>
                <InfoIcon src={WalletIcon} />
              </InfoIconContainer>
              {t('SUMMARY.YOUR_ADDRESS')}
            </IconLabel>
            <div>{getShortTruncatedAddress(ordinalsAddress)}</div>
          </CardRow>
        </CardContainer>
        <CardContainer>
          <CardRow>
            <div>{t('NETWORK')}</div>
            <div>{network.type}</div>
          </CardRow>
        </CardContainer>
        <CardContainer>
          <CardRow>
            <div>{t('VALUE')}</div>
            <div>
              {isLoading && <MoonLoader color="white" size={20} />}
              {!isLoading && (
                <NumericFormat
                  value={commitValue}
                  displayType="text"
                  thousandSeparator
                  suffix=" sats"
                />
              )}
            </div>
          </CardRow>
        </CardContainer>
        <CardContainer bottomPadding>
          <CardRow>
            <div>{t('FEES.TITLE')}</div>
            <div>{isLoading && <MoonLoader color="white" size={20} />}</div>
          </CardRow>
          {!isLoading && (
            <>
              <CardRow topMargin>
                <div>{t('FEES.INSCRIPTION')}</div>
                <NumericFormat
                  value={serviceFee}
                  displayType="text"
                  thousandSeparator
                  suffix=" sats"
                />
              </CardRow>
              <CardRow topMargin>
                <div>{t('FEES.TRANSACTION')}</div>
                <NumberWithSuffixContainer>
                  <NumericFormat
                    value={chainFee}
                    displayType="text"
                    thousandSeparator
                    suffix=" sats"
                  />
                  <NumericFormat
                    value={feeRate}
                    displayType="text"
                    thousandSeparator
                    suffix=" sats/vB"
                    renderText={(value: string) => <NumberSuffix>{value}</NumberSuffix>}
                  />
                </NumberWithSuffixContainer>
              </CardRow>
              <CardRow topMargin>
                <div>{t('FEES.TOTAL')}</div>
                <div>
                  <NumberWithSuffixContainer>
                    <NumericFormat
                      value={totalFee}
                      displayType="text"
                      thousandSeparator
                      suffix=" sats"
                    />
                    <NumericFormat
                      value={fiatFees}
                      displayType="text"
                      thousandSeparator
                      suffix=" USD"
                      prefix="~$"
                      renderText={(value: string) => <NumberSuffix>{value}</NumberSuffix>}
                    />
                  </NumberWithSuffixContainer>
                </div>
              </CardRow>
            </>
          )}
        </CardContainer>
        <Button onClick={onAdvancedSettingClick}>
          <ButtonImage src={SettingIcon} />
          <ButtonText>{t('EDIT_FEES')}</ButtonText>
        </Button>
        {showFeeSettings && (
          <EditFee
            feeRate={feeRate}
            onDone={onNewFeeRateSet}
            onCancel={() => setShowFeeSettings(false)}
          />
        )}
        <ErrorContainer>
          <ErrorText>{errorCode || executeErrorCode}</ErrorText> {/* TODO: show error */}
        </ErrorContainer>
      </MainContainer>
    </ConfirmScreen>
  );
}

export default CreateInscription;
