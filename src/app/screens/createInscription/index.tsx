import TransportFactory from '@ledgerhq/hw-transport-webusb';
import BigNumber from 'bignumber.js';
import { decodeToken } from 'jsontokens';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useLocation } from 'react-router-dom';

import type { CreateInscriptionPayload, CreateRepeatInscriptionsPayload } from '@sats-connect/core';
import {
  AnalyticsEvents,
  InscriptionErrorCode,
  currencySymbolMap,
  fetchBtcFeeRate,
  getNonOrdinalUtxo,
  useInscriptionExecute,
  useInscriptionFees,
  type BtcFeeResponse,
  type Transport,
  type UTXO,
} from '@secretkeylabs/xverse-core';

import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import AccountHeaderComponent from '@components/accountHeader';
import ConfirmScreen from '@components/confirmScreen';
import useWalletSelector from '@hooks/useWalletSelector';
import { isLedgerAccount } from '@utils/helper';

import useBtcClient from '@hooks/apiClients/useBtcClient';
import useConfirmedBtcBalance from '@hooks/queries/useConfirmedBtcBalance';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import Spinner from '@ui-library/spinner';
import { trackMixPanel } from '@utils/mixpanel';
import InscribeSection from 'app/components/confirmBtcTransaction/sections/inscribeSection';
import CompleteScreen from './CompleteScreen';
import EditFee from './EditFee';
import ErrorModal from './ErrorModal';
import LedgerStepView from './ledgerStepView';

import FeeRow, { SATS_PER_BTC } from './feeRow';

import {
  ButtonImage,
  ButtonText,
  CardContainer,
  CardRow,
  EditFeesButton,
  MainContainer,
  NumberSuffix,
  NumberWithSuffixContainer,
  OuterContainer,
  StyledCallout,
  SubTitle,
  SuccessActionsContainer,
  Title,
} from './index.styled';

const DEFAULT_FEE_RATE = 8;
const MAX_REPEATS = 24;

function CreateInscription() {
  const { t } = useTranslation('translation', { keyPrefix: 'INSCRIPTION_REQUEST' });
  const { t: tUnits } = useTranslation('translation', { keyPrefix: 'UNITS' });

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
  const showOver24RepeatsError = !Number.isNaN(repeat) && repeat > MAX_REPEATS;

  const [utxos, setUtxos] = useState<UTXO[] | undefined>();
  const [showFeeSettings, setShowFeeSettings] = useState(false);
  const [showConfirmedBalanceError, setShowConfirmedBalanceError] = useState(false);
  const [feeRate, setFeeRate] = useState(suggestedMinerFeeRate ?? DEFAULT_FEE_RATE);
  const [feeRates, setFeeRates] = useState<BtcFeeResponse>();
  const btcClient = useBtcClient();

  const selectedAccount = useSelectedAccount();
  const { ordinalsAddress, btcAddress } = selectedAccount;
  const { network, fiatCurrency } = useWalletSelector();
  const { btcFiatRate } = useSupportedCoinRates();

  const transactionContext = useTransactionContext();

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
    context: transactionContext,
    content,
    contentType,
    feeRate,
    revealAddress: ordinalsAddress,
    serviceFee: appFee,
    serviceFeeAddress: appFeeAddress,
    repetitions: repeat,
  });

  const {
    complete,
    errorCode: executeErrorCode,
    executeMint,
    revealTransactionId,
    isExecuting,
  } = useInscriptionExecute({
    context: transactionContext,
    contentType,
    feeRate,
    revealAddress: ordinalsAddress,
    contentBase64: payloadType === 'BASE_64' ? content : undefined,
    contentString: payloadType === 'PLAIN_TEXT' ? content : undefined,
    serviceFee: appFee,
    serviceFeeAddress: appFeeAddress,
    repetitions: repeat,
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isLedgerConnectVisible, setIsLedgerConnectVisible] = useState(false);

  const isLedger = isLedgerAccount(selectedAccount);

  const cancelCallback = () => {
    const response = {
      source: MESSAGE_SOURCE,
      method: repeat
        ? SatsConnectMethods.createRepeatInscriptionsResponse
        : SatsConnectMethods.createInscriptionResponse,
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

  const { confirmedBalance, isLoading: confirmedBalanceLoading } = useConfirmedBtcBalance();

  const chainFee = (revealChainFee ?? 0) + (commitChainFee ?? 0);
  const totalFee = (revealServiceFee ?? 0) + (externalServiceFee ?? 0) + chainFee;

  const showTotalFee = totalFee !== chainFee;

  const toFiat = (value: number | string = 0) =>
    new BigNumber(value).dividedBy(SATS_PER_BTC).multipliedBy(btcFiatRate).toFixed(2);

  const bundlePlusFees = new BigNumber(totalFee ?? 0)
    .plus(new BigNumber(totalInscriptionValue ?? 0))
    .toString();

  const nonLedgerExecuteErrorCode =
    executeErrorCode &&
    (executeErrorCode === InscriptionErrorCode.DEVICE_LOCKED ||
      executeErrorCode === InscriptionErrorCode.USER_REJECTED ||
      executeErrorCode === InscriptionErrorCode.GENERAL_LEDGER_ERROR)
      ? undefined
      : executeErrorCode;
  const errorCode = feeErrorCode || nonLedgerExecuteErrorCode;

  const isLoading = utxos === undefined || inscriptionFeesLoading;

  useEffect(() => {
    const showConfirmError =
      !isLoading &&
      !confirmedBalanceLoading &&
      errorCode !== InscriptionErrorCode.INSUFFICIENT_FUNDS &&
      confirmedBalance !== undefined &&
      Number(bundlePlusFees) > confirmedBalance;
    setShowConfirmedBalanceError(!!showConfirmError);
  }, [confirmedBalance, errorCode, bundlePlusFees, isLoading, confirmedBalanceLoading]);

  if (complete && revealTransactionId) {
    const onClose = () => {
      const response = {
        source: MESSAGE_SOURCE,
        method: repeat
          ? SatsConnectMethods.createRepeatInscriptionsResponse
          : SatsConnectMethods.createInscriptionResponse,
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

  const handleExecuteMint = (ledgerTransport?: Transport) => {
    trackMixPanel(AnalyticsEvents.TransactionConfirmed, {
      protocol: 'ordinals',
      action: 'inscribe',
      wallet_type: selectedAccount?.accountType || 'software',
      repeat,
    });

    executeMint({ ledgerTransport });
  };

  const handleLedgerConnect = async () => {
    try {
      setIsConnectSuccess(false);
      setIsConnectFailed(false);
      setIsConnecting(true);

      const ledgerTransport = await TransportFactory.create();

      if (!ledgerTransport) {
        setIsConnectSuccess(false);
        setIsConnectFailed(true);
        return;
      }

      setIsConnectSuccess(true);
      setIsConnecting(false);
      handleExecuteMint(ledgerTransport);
    } catch (error) {
      console.error(error);
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLedgerConnectCancel = () => {
    setIsLedgerConnectVisible(false);
  };

  const handleClickConfirm = () => {
    if (!isLedger) {
      handleExecuteMint();
    } else {
      setIsLedgerConnectVisible(true);
    }
  };

  const disableConfirmButton =
    !!errorCode || isExecuting || showOver24RepeatsError || showConfirmedBalanceError;

  const canLedgerRetry =
    executeErrorCode === InscriptionErrorCode.USER_REJECTED ||
    executeErrorCode === InscriptionErrorCode.GENERAL_LEDGER_ERROR;

  return (
    <ConfirmScreen
      onConfirm={handleClickConfirm}
      onCancel={cancelCallback}
      cancelText={t('CANCEL_BUTTON')}
      confirmText={!errorCode ? t('CONFIRM_BUTTON') : t(`ERRORS.SHORT.${errorCode}`)}
      loading={isExecuting || isLoading}
      disabled={disableConfirmButton}
      isError={!!errorCode || showOver24RepeatsError}
    >
      <OuterContainer>
        <AccountHeaderComponent disableMenuOption disableAccountSwitch />
        <MainContainer>
          <Title>{t('TITLE')}</Title>
          <SubTitle>{t('SUBTITLE', { name: appName ?? '' })}</SubTitle>
          {showOver24RepeatsError && (
            <StyledCallout
              variant="danger"
              bodyText={t('ERRORS.TOO_MANY_REPEATS', { maxRepeats: MAX_REPEATS })}
            />
          )}
          {showConfirmedBalanceError && (
            <StyledCallout variant="danger" bodyText={t('ERRORS.UNCONFIRMED_UTXO')} />
          )}
          {isLedgerAccount(selectedAccount) && (
            <StyledCallout variant="danger" bodyText={t('ERRORS.LEDGER_INSCRIPTION')} />
          )}
          <InscribeSection
            content={content}
            contentType={contentType}
            repeat={repeat}
            payloadType={payloadType}
            ordinalsAddress={ordinalsAddress}
          />
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
              <div>{isLoading && <Spinner color="white" size={20} />}</div>
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
                  suffix={` ${tUnits('SATS_PER_VB')}`}
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
          <EditFeesButton onClick={onAdvancedSettingClick}>
            <ButtonImage src={SettingIcon} />
            <ButtonText>{t('EDIT_FEES')}</ButtonText>
          </EditFeesButton>
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
              onRetrySubmit={executeErrorCode ? handleClickConfirm : undefined}
              onEnd={cancelCallback}
            />
          )}
          <Sheet
            title=""
            visible={isLedgerConnectVisible}
            onClose={isConnectSuccess ? undefined : handleLedgerConnectCancel}
          >
            <LedgerStepView
              isConnectSuccess={isConnectSuccess}
              isConnectFailed={isConnectFailed || !!executeErrorCode}
              errorCode={executeErrorCode}
            />
            <SuccessActionsContainer>
              {(!isConnectSuccess || canLedgerRetry) && (
                <>
                  <Button
                    onClick={handleLedgerConnect}
                    title={t(
                      isConnectFailed || canLedgerRetry
                        ? 'LEDGER.RETRY_BUTTON'
                        : 'LEDGER.CONNECT_BUTTON',
                    )}
                    disabled={isConnecting}
                    loading={isConnecting}
                  />
                  <Button
                    onClick={handleLedgerConnectCancel}
                    title={t('LEDGER.CANCEL_BUTTON')}
                    variant="tertiary"
                  />
                </>
              )}
            </SuccessActionsContainer>
          </Sheet>
        </MainContainer>
      </OuterContainer>
    </ConfirmScreen>
  );
}

export default CreateInscription;
