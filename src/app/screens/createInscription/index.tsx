import { Wallet } from '@phosphor-icons/react';
import BigNumber from 'bignumber.js';
import { decodeToken } from 'jsontokens';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useLocation } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';

import {
  BtcFeeResponse,
  currencySymbolMap,
  fetchBtcFeeRate,
  getNonOrdinalUtxo,
  useInscriptionExecute,
  useInscriptionFees,
  UTXO,
} from '@secretkeylabs/xverse-core';
import { CreateInscriptionPayload } from 'sats-connect';

import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import { ExternalSatsMethods, MESSAGE_SOURCE } from '@common/types/message-types';
import AccountHeaderComponent from '@components/accountHeader';
import ConfirmScreen from '@components/confirmScreen';
import useWalletSelector from '@hooks/useWalletSelector';
import { getShortTruncatedAddress } from '@utils/helper';

import useSeedVault from '@hooks/useSeedVault';
import CompleteScreen from './CompleteScreen';
import ContentLabel from './ContentLabel';
import EditFee from './EditFee';
import ErrorModal from './ErrorModal';

const OuterContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

const MainContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  flex: 1,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
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
  center?: boolean;
};
const CardRow = styled.div<CardRowProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: props.center ? 'center' : 'flex-start',
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

const MutedLabel = styled.div((props) => ({
  color: props.theme.colors.white[400],
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

const DEFAULT_FEE_RATE = 8;

function CreateInscription() {
  const { t } = useTranslation('translation', { keyPrefix: 'INSCRIPTION_REQUEST' });
  const { search } = useLocation();

  const [payload, requestToken, tabId] = useMemo(() => {
    const params = new URLSearchParams(search);
    const requestEncoded = params.get('createInscription');
    const requestBody = decodeToken(requestEncoded as string);
    return [requestBody.payload as unknown, requestEncoded, Number(params.get('tabId'))];
  }, [search]);

  const {
    contentType,
    content,
    payloadType,
    network: requestedNetwork,
    appFeeAddress,
    appFee,
    suggestedMinerFeeRate,
  } = payload as CreateInscriptionPayload;

  const [utxos, setUtxos] = useState<UTXO[] | undefined>();
  const [showFeeSettings, setShowFeeSettings] = useState(false);
  const [feeRate, setFeeRate] = useState(suggestedMinerFeeRate ?? DEFAULT_FEE_RATE);
  const [feeRates, setFeeRates] = useState<BtcFeeResponse>();
  const { getSeed } = useSeedVault();

  const { ordinalsAddress, network, btcAddress, selectedAccount, btcFiatRate, fiatCurrency } =
    useWalletSelector();

  useEffect(() => {
    getNonOrdinalUtxo(btcAddress, requestedNetwork.type).then(setUtxos);
  }, [btcAddress, requestedNetwork]);

  useEffect(() => {
    fetchBtcFeeRate(network.type).then((feeRatesResponse: BtcFeeResponse) => {
      setFeeRates(feeRatesResponse);
      if (suggestedMinerFeeRate === undefined) {
        setFeeRate(feeRatesResponse.regular);
      } else if (suggestedMinerFeeRate < feeRatesResponse.limits.min) {
        setFeeRate(feeRatesResponse.limits.min);
      } else if (suggestedMinerFeeRate > feeRatesResponse.limits.max) {
        setFeeRate(feeRatesResponse.limits.max);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to run this once on load
  }, []);

  const contentIsInvalidJson = useMemo(() => {
    let stringContent = content;
    if (payloadType === 'BASE_64') {
      stringContent = atob(content as string);
    }
    // if content type is json, ensure content is valid json
    if (contentType.startsWith('application/json')) {
      try {
        JSON.parse(stringContent as string);
        return false;
      } catch (e) {
        return true;
      }
    }
  }, [contentType, content, payloadType]);

  const {
    commitValue,
    commitValueBreakdown,
    errorCode: feeErrorCode,
    isLoading: inscriptionFeesLoading,
  } = useInscriptionFees({
    addressUtxos: utxos,
    content,
    contentType,
    feeRate,
    revealAddress: ordinalsAddress,
    serviceFee: appFee,
    serviceFeeAddress: appFeeAddress,
    network: network.type,
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
    getSeedPhrase: getSeed,
    contentBase64: payloadType === 'BASE_64' ? content : undefined,
    contentString: payloadType === 'PLAIN_TEXT' ? content : undefined,
    serviceFee: appFee,
    serviceFeeAddress: appFeeAddress,
  });

  const cancelCallback = () => {
    const response = {
      source: MESSAGE_SOURCE,
      method: ExternalSatsMethods.createInscriptionResponse,
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

  const revealServiceFee = commitValueBreakdown?.revealServiceFee;
  const externalServiceFee = commitValueBreakdown?.externalServiceFee;
  const chainFee =
    (commitValueBreakdown?.revealChainFee ?? 0) + (commitValueBreakdown?.commitChainFee ?? 0);
  const totalFee = (revealServiceFee ?? 0) + (externalServiceFee ?? 0) + chainFee;

  const fiatFees = new BigNumber(totalFee).dividedBy(100e6).multipliedBy(btcFiatRate).toFixed(2);

  const fiatValue = new BigNumber(commitValue ?? 0)
    .dividedBy(100e6)
    .multipliedBy(btcFiatRate)
    .toFixed(2);

  if (complete && revealTransactionId) {
    const onClose = () => {
      const response = {
        source: MESSAGE_SOURCE,
        method: ExternalSatsMethods.createInscriptionResponse,
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

    return <CompleteScreen txId={revealTransactionId} onClose={onClose} network={network} />;
  }

  const errorCode = feeErrorCode || executeErrorCode;

  const isLoading = utxos === undefined || inscriptionFeesLoading;

  return (
    <ConfirmScreen
      onConfirm={executeMint}
      onCancel={cancelCallback}
      cancelText={t('CANCEL_BUTTON')}
      confirmText={!errorCode ? t('CONFIRM_BUTTON') : t(`ERRORS.SHORT.${errorCode}`)}
      loading={isExecuting || isLoading}
      disabled={!!errorCode || isExecuting}
      isError={!!errorCode}
    >
      <OuterContainer>
        <AccountHeaderComponent disableMenuOption disableAccountSwitch />
        <MainContainer>
          <Title>{t('TITLE')}</Title>
          <SubTitle>{t('SUBTITLE')}</SubTitle>
          <CardContainer bottomPadding>
            <CardRow>
              <div>{t('SUMMARY.TITLE')}</div>
            </CardRow>
            <CardRow topMargin center>
              <IconLabel>
                <div>
                  <ButtonIcon src={OrdinalsIcon} />
                </div>
                <div>{t('SUMMARY.ORDINAL')}</div>
              </IconLabel>
              <ContentLabel contentType={contentType} content={content} type={payloadType} />
            </CardRow>
            <CardRow topMargin>
              <MutedLabel>{t('SUMMARY.TO')}</MutedLabel>
            </CardRow>
            <CardRow topMargin center>
              <IconLabel>
                <InfoIconContainer>
                  <Wallet size={18} />
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
                  <NumberWithSuffixContainer>
                    <NumericFormat
                      value={commitValue}
                      displayType="text"
                      thousandSeparator
                      suffix=" sats"
                    />
                    <NumericFormat
                      value={fiatValue}
                      displayType="text"
                      thousandSeparator
                      prefix={`${currencySymbolMap[fiatCurrency]} `}
                      suffix={` ${fiatCurrency}`}
                      renderText={(value: string) => <NumberSuffix>{value}</NumberSuffix>}
                    />
                  </NumberWithSuffixContainer>
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
                    value={revealServiceFee ?? 0}
                    displayType="text"
                    thousandSeparator
                    suffix=" sats"
                  />
                </CardRow>
                {externalServiceFee && (
                  <CardRow topMargin>
                    <div>{t('FEES.DEVELOPER')}</div>
                    <NumericFormat
                      value={externalServiceFee}
                      displayType="text"
                      thousandSeparator
                      suffix=" sats"
                    />
                  </CardRow>
                )}
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
                        prefix={`${currencySymbolMap[fiatCurrency]} `}
                        suffix={` ${fiatCurrency}`}
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
              feeRates={feeRates}
              onDone={onNewFeeRateSet}
              onCancel={() => setShowFeeSettings(false)}
            />
          )}
          {contentIsInvalidJson && (
            <ErrorModal
              key="invalid-json"
              errorCode="INVALID_JSON_CONTENT"
              onEnd={cancelCallback}
            />
          )}
          {errorCode && (
            <ErrorModal
              key={errorCode}
              errorCode={errorCode}
              onRetrySubmit={executeErrorCode ? executeMint : undefined}
              onEnd={cancelCallback}
            />
          )}
        </MainContainer>
      </OuterContainer>
    </ConfirmScreen>
  );
}

export default CreateInscription;
