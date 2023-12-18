import { ArrowDown } from '@phosphor-icons/react';
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
import { CreateInscriptionPayload, CreateRepeatInscriptionsPayload } from 'sats-connect';

import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import { ExternalSatsMethods, MESSAGE_SOURCE } from '@common/types/message-types';
import AccountHeaderComponent from '@components/accountHeader';
import ConfirmScreen from '@components/confirmScreen';
import useWalletSelector from '@hooks/useWalletSelector';
import { getShortTruncatedAddress } from '@utils/helper';

import useBtcClient from '@hooks/useBtcClient';
import useSeedVault from '@hooks/useSeedVault';
import Callout from '@ui-library/callout';
import { StyledP } from '@ui-library/common.styled';
import CompleteScreen from './CompleteScreen';
import ContentLabel from './ContentLabel';
import EditFee from './EditFee';
import ErrorModal from './ErrorModal';

const SATS_PER_BTC = 100e6;

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

const NumberWithSuffixContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  color: props.theme.colors.white_0,
}));

const NumberSuffix = styled.div((props) => ({
  ...props.theme.typography.body_s,
  color: props.theme.colors.white_400,
}));

const StyledPillLabel = styled.p`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.space.s};
`;

const Pill = styled.span`
  ${(props) => props.theme.typography.body_bold_s}
  color: ${(props) => props.theme.colors.elevation0};
  background-color: ${(props) => props.theme.colors.white_0};
  padding: 3px 6px;
  border-radius: 40px;
`;

function FeeRow({
  label,
  subLabel,
  value = 0,
  fiatCurrency,
  fiatRate,
  repeat,
}: {
  label: string;
  subLabel?: string;
  value?: number | string | null;
  fiatCurrency: string;
  fiatRate: string;
  repeat?: number;
}) {
  if (!value) {
    return null;
  }
  const fiatValue = new BigNumber(value || 0)
    .dividedBy(SATS_PER_BTC)
    .multipliedBy(fiatRate)
    .toFixed(2);

  return (
    <CardRow>
      <div>
        <StyledPillLabel>
          {label}
          {repeat && <Pill>{`x${repeat}`}</Pill>}
        </StyledPillLabel>
        {!!subLabel && <NumberSuffix>{subLabel}</NumberSuffix>}
      </div>
      <NumberWithSuffixContainer>
        <NumericFormat value={value} displayType="text" thousandSeparator suffix=" sats" />
        <NumericFormat
          value={fiatValue}
          displayType="text"
          thousandSeparator
          prefix={`~ ${currencySymbolMap[fiatCurrency]}`}
          suffix={` ${fiatCurrency}`}
          renderText={(val: string) => <NumberSuffix>{val}</NumberSuffix>}
        />
      </NumberWithSuffixContainer>
    </CardRow>
  );
}

const YourAddress = styled.div`
  text-align: right;
`;

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
  ...props.theme.typography.headline_s,
  marginTop: props.theme.spacing(11),
  color: props.theme.colors.white_0,
  textAlign: 'left',
}));

const SubTitle = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  marginTop: props.theme.spacing(4),
  textAlign: 'left',
  marginBottom: props.theme.spacing(12),
}));

const StyledCallout = styled(Callout)`
  margin-bottom: ${(props) => props.theme.space.m};
`;

const CardContainer = styled.div<{ bottomPadding?: boolean }>((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.m,
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: props.theme.spacing(8),
  paddingBottom: props.bottomPadding ? props.theme.spacing(12) : props.theme.spacing(8),
  justifyContent: 'center',
  marginBottom: props.theme.spacing(6),
  fontSize: 14,
}));

const IconLabel = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ButtonIcon = styled.img((props) => ({
  width: 32,
  height: 32,
  marginRight: props.theme.spacing(4),
}));

const InfoIconContainer = styled.div((props) => ({
  background: props.theme.colors.white_0,
  color: props.theme.colors.elevation0,
  width: 32,
  height: 32,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  marginRight: props.theme.spacing(5),
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
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

const DEFAULT_FEE_RATE = 8;

function CreateInscription() {
  const { t } = useTranslation('translation', { keyPrefix: 'INSCRIPTION_REQUEST' });
  const { search } = useLocation();

  const [payload, requestToken, tabId, origin] = useMemo(() => {
    const params = new URLSearchParams(search);
    const requestEncoded =
      params.get('createInscription') ?? params.get('createRepeatInscriptions');
    const requestBody = decodeToken(requestEncoded as string);
    return [
      requestBody.payload as unknown,
      requestEncoded,
      Number(params.get('tabId')),
      params.get('origin'),
    ];
  }, [search]);

  const appName = new URL(origin || '')?.host;

  const {
    contentType,
    content,
    payloadType,
    network: requestedNetwork,
    appFeeAddress,
    appFee,
    suggestedMinerFeeRate,
  } = payload as CreateInscriptionPayload | CreateRepeatInscriptionsPayload;

  const { repeat } = payload as CreateRepeatInscriptionsPayload;
  const showOver24RepeatsError = !Number.isNaN(repeat) && repeat > 24;

  const [utxos, setUtxos] = useState<UTXO[] | undefined>();
  const [showFeeSettings, setShowFeeSettings] = useState(false);
  const [feeRate, setFeeRate] = useState(suggestedMinerFeeRate ?? DEFAULT_FEE_RATE);
  const [feeRates, setFeeRates] = useState<BtcFeeResponse>();
  const { getSeed } = useSeedVault();
  const btcClient = useBtcClient();

  const { ordinalsAddress, network, btcAddress, selectedAccount, btcFiatRate, fiatCurrency } =
    useWalletSelector();

  useEffect(() => {
    getNonOrdinalUtxo(btcAddress, btcClient, requestedNetwork.type).then(setUtxos);
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
    repetitions: repeat,
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
    repetitions: repeat,
  });

  const cancelCallback = () => {
    const response = {
      source: MESSAGE_SOURCE,
      method: repeat
        ? ExternalSatsMethods.createRepeatInscriptionsResponse
        : ExternalSatsMethods.createInscriptionResponse,
      payload: {
        createInscriptionRequest: requestToken,
        createInscriptionResponse: 'cancel',
        ...(repeat ? { repeat } : null),
      },
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

  const {
    revealServiceFee,
    externalServiceFee,
    revealChainFee,
    commitChainFee,
    totalInscriptionValue,
    inscriptionValue,
  } = commitValueBreakdown ?? {};

  const chainFee = (revealChainFee ?? 0) + (commitChainFee ?? 0);
  const totalFee = (revealServiceFee ?? 0) + (externalServiceFee ?? 0) + chainFee;
  const showTotalFee = totalFee !== chainFee;

  const toFiat = (value: number | string = 0) =>
    new BigNumber(value).dividedBy(SATS_PER_BTC).multipliedBy(btcFiatRate).toFixed(2);

  const bundlePlusFees = new BigNumber(totalFee ?? 0)
    .plus(new BigNumber(totalInscriptionValue ?? 0))
    .toString();

  if (complete && revealTransactionId) {
    const onClose = () => {
      const response = {
        source: MESSAGE_SOURCE,
        method: repeat
          ? ExternalSatsMethods.createRepeatInscriptionsResponse
          : ExternalSatsMethods.createInscriptionResponse,
        payload: repeat
          ? {
              createRepeatInscriptionsRequest: requestToken,
              createRepeatInscriptionsResponse: {
                txId: revealTransactionId,
              },
            }
          : {
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
      disabled={!!errorCode || isExecuting || showOver24RepeatsError}
      isError={!!errorCode || showOver24RepeatsError}
    >
      <OuterContainer>
        <AccountHeaderComponent disableMenuOption disableAccountSwitch />
        <MainContainer>
          <Title>{t('TITLE')}</Title>
          <SubTitle>{t('SUBTITLE', { name: appName ?? '' })}</SubTitle>
          {showOver24RepeatsError && (
            <StyledCallout variant="danger" bodyText={t('ERRORS.TOO_MANY_REPEATS')} />
          )}
          <CardContainer bottomPadding>
            <CardRow>
              <StyledPillLabel>
                {t('SUMMARY.TITLE')}
                {repeat && <Pill>{`x${repeat}`}</Pill>}
              </StyledPillLabel>
            </CardRow>
            <CardRow center>
              <IconLabel>
                <div>
                  <ButtonIcon src={OrdinalsIcon} />
                </div>
                <div>{t('SUMMARY.ORDINAL')}</div>
              </IconLabel>
              <ContentLabel
                contentType={contentType}
                content={content}
                type={payloadType}
                repeat={repeat}
              />
            </CardRow>
            <CardRow center>
              <IconLabel>
                <InfoIconContainer>
                  <ArrowDown size={16} weight="bold" />
                </InfoIconContainer>
                {t('SUMMARY.TO')}
              </IconLabel>
              <YourAddress>
                <StyledP typography="body_medium_m" color="white_0">
                  {getShortTruncatedAddress(ordinalsAddress)}
                </StyledP>
                <StyledP typography="body_medium_s" color="white_400">
                  {t('SUMMARY.YOUR_ADDRESS')}
                </StyledP>
              </YourAddress>
            </CardRow>
          </CardContainer>
          <CardContainer>
            <CardRow>
              <div>{t('NETWORK')}</div>
              <StyledP typography="body_medium_m" color="white_0">
                {network.type}
              </StyledP>
            </CardRow>
          </CardContainer>
          <CardContainer>
            <FeeRow
              label={t('VALUE')}
              value={inscriptionValue}
              fiatCurrency={fiatCurrency}
              fiatRate={btcFiatRate}
              repeat={repeat}
            />
          </CardContainer>
          <CardContainer bottomPadding>
            <CardRow>
              <div>{t('FEES.TITLE')}</div>
              <div>{isLoading && <MoonLoader color="white" size={20} />}</div>
            </CardRow>
            <FeeRow
              label={t('FEES.INSCRIPTION')}
              value={revealServiceFee}
              fiatCurrency={fiatCurrency}
              fiatRate={btcFiatRate}
            />
            <FeeRow
              label={t('FEES.DEVELOPER')}
              value={externalServiceFee}
              fiatCurrency={fiatCurrency}
              fiatRate={btcFiatRate}
            />
            <CardRow>
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
                <NumericFormat
                  value={toFiat(chainFee)}
                  displayType="text"
                  thousandSeparator
                  prefix={`~ ${currencySymbolMap[fiatCurrency]}`}
                  suffix={` ${fiatCurrency}`}
                  renderText={(value: string) => <NumberSuffix>{value}</NumberSuffix>}
                />
              </NumberWithSuffixContainer>
            </CardRow>
            {showTotalFee && (
              <FeeRow
                label={t('FEES.TOTAL')}
                value={totalFee}
                fiatCurrency={fiatCurrency}
                fiatRate={btcFiatRate}
              />
            )}
          </CardContainer>
          <CardContainer>
            <FeeRow
              label={t('TOTAL')}
              subLabel={t('AMOUNT_PLUS_FEES')}
              value={bundlePlusFees}
              fiatCurrency={fiatCurrency}
              fiatRate={btcFiatRate}
            />
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
