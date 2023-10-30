import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectBtcIcon from '@assets/img/ledger/ledger_import_connect_btc.svg';
import { ExternalSatsMethods, MESSAGE_SOURCE } from '@common/types/message-types';
import { ledgerDelay } from '@common/utils/ledger';
import AccountHeaderComponent from '@components/accountHeader';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import InputOutputComponent from '@components/confirmBtcTransactionComponent/inputOutputComponent';
import InfoContainer from '@components/infoContainer';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import RecipientComponent from '@components/recipientComponent';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useBtcClient from '@hooks/useBtcClient';
import useDetectOrdinalInSignBatchPsbt from '@hooks/useDetectOrdinalInSignBatchPsbt';
import useSignBatchPsbtTx from '@hooks/useSignBatchPsbtTx';
import useWalletSelector from '@hooks/useWalletSelector';
import Transport from '@ledgerhq/hw-transport-webusb';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import {
  getBtcFiatEquivalent,
  satsToBtc,
  signIncomingSingleSigPSBT,
} from '@secretkeylabs/xverse-core';
import { Transport as TransportType } from '@secretkeylabs/xverse-core/ledger/types';
import { parsePsbt, psbtBase64ToHex } from '@secretkeylabs/xverse-core/transactions/psbt';
import { isLedgerAccount } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { decodeToken } from 'jsontokens';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useLocation, useNavigate } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import { SignTransactionOptions } from 'sats-connect';
import styled from 'styled-components';
import BundleItemsComponent from './bundleItemsComponent';

const OuterContainer = styled.div`
  display: flex;
  flex: 1;
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

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(12),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(20),
  marginTop: props.theme.spacing(12),
}));

const TransparentButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(6),
  width: '100%',
}));

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(12),
  textAlign: 'left',
}));

const SuccessActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing(6),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(20),
  marginTop: props.theme.spacing(20),
}));

const BundleLinkContainer = styled.button((props) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'transparent',
  color: props.theme.colors.tangerine,
  transition: 'color 0.2s ease',
  marginBottom: props.theme.spacing(6),
  ':hover': {
    color: props.theme.colors.tangerine_light,
  },
}));
const BundleLinkText = styled.div((props) => ({
  ...props.theme.body_medium_m,
  marginRight: props.theme.spacing(2),
}));

const CustomizedModal = styled(BottomModal)`
  height: 100%;
  max-height: 100% !important;
  background-color: #181818 !important;
`;

const CustomizedModalContent = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: 'calc(100% - 67.5px)',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  paddingBottom: props.theme.spacing(20),
}));

const TxReviewModalControls = styled.div((props) => ({
  display: 'flex',
  columnGap: props.theme.spacing(6),
}));

function SignBatchPsbtRequest() {
  const { btcAddress, ordinalsAddress, selectedAccount, network, btcFiatRate } =
    useWalletSelector();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });
  const [expandInputOutputView, setExpandInputOutputView] = useState(false);
  const { payload, confirmSignPsbt, cancelSignPsbt, getSigningAddresses } = useSignBatchPsbtTx();
  const [isSigning, setIsSigning] = useState(false);
  const [hasOutputScript, setHasOutputScript] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isTxApproved, setIsTxApproved] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);
  const [currentPsbtIndex, setCurrentPsbtIndex] = useState(0);
  const { search } = useLocation();
  const [reviewTransaction, setReviewTransaction] = useState(false);
  const params = new URLSearchParams(search);
  const tabId = params.get('tabId') ?? '0';
  const requestToken = params.get('signPsbtRequest') ?? '';
  const request = decodeToken(requestToken) as any as SignTransactionOptions;
  const btcClient = useBtcClient();

  const handlePsbtParsing = useCallback(
    (item) => {
      try {
        return parsePsbt(selectedAccount!, item.inputsToSign, item.psbtBase64, network.type);
      } catch (err) {
        return '';
      }
    },
    [selectedAccount, network.type],
  );

  const parsedPsbts = useMemo(
    () => payload.psbts.map(handlePsbtParsing),
    [handlePsbtParsing, payload.psbts],
  );

  const userReceivesOrdinalArr = useDetectOrdinalInSignBatchPsbt(parsedPsbts);

  const checkIfMismatch = () => {
    // if (!parsedPsbt) {
    //   navigate('/tx-status', {
    //     state: {
    //       txid: '',
    //       currency: 'BTC',
    //       errorTitle: t('PSBT_CANT_PARSE_ERROR_TITLE'),
    //       error: t('PSBT_CANT_PARSE_ERROR_DESCRIPTION'),
    //       browserTx: true,
    //     },
    //   });
    // }
    // if (payload.network.type !== network.type) {
    //   navigate('/tx-status', {
    //     state: {
    //       txid: '',
    //       currency: 'BTC',
    //       error: t('NETWORK_MISMATCH'),
    //       browserTx: true,
    //     },
    //   });
    // }
    // if (payload.inputsToSign) {
    //   payload.inputsToSign.forEach((input) => {
    //     if (input.address !== btcAddress && input.address !== ordinalsAddress) {
    //       navigate('/tx-status', {
    //         state: {
    //           txid: '',
    //           currency: 'STX',
    //           error: t('ADDRESS_MISMATCH'),
    //           browserTx: true,
    //         },
    //       });
    //     }
    //   });
    // }
  };

  useEffect(() => {
    checkIfMismatch();
  }, []);

  useEffect(() => {
    if (parsedPsbts) {
      let outputScriptDetected = false;

      parsedPsbts.forEach((psbt) => {
        if (!psbt) {
          return;
        }

        if (psbt.outputs.some((output) => !!output.outputScript)) {
          outputScriptDetected = true;
        }
      });

      setHasOutputScript(outputScriptDetected);
    }
  }, [parsedPsbts]);

  const onSignPsbtConfirmed = async () => {
    // try {
    //   if (isLedgerAccount(selectedAccount)) {
    //     // setIsModalVisible(true);
    //     return;
    //   }
    //   setIsSigning(true);
    //   const response = await confirmSignPsbt();
    //   setIsSigning(false);
    //   if (payload.broadcast) {
    //     navigate('/tx-status', {
    //       state: {
    //         txid: response.txId,
    //         currency: 'BTC',
    //         error: '',
    //         browserTx: true,
    //       },
    //     });
    //   } else {
    //     window.close();
    //   }
    // } catch (err) {
    //   if (err instanceof Error) {
    //     navigate('/tx-status', {
    //       state: {
    //         txid: '',
    //         currency: 'BTC',
    //         errorTitle: !payload.broadcast ? t('PSBT_CANT_SIGN_ERROR_TITLE') : '',
    //         error: err.message,
    //         browserTx: true,
    //       },
    //     });
    //   }
    // }
  };

  const onCancelClick = async () => {
    cancelSignPsbt();
    window.close();
  };

  const expandInputOutputSection = () => {
    setExpandInputOutputView(!expandInputOutputView);
  };

  const handleLedgerPsbtSigning = async (transport: TransportType) => {
    // const addressIndex = selectedAccount?.deviceAccountIndex;
    // const { inputsToSign, psbtBase64, broadcast } = payload;
    // if (addressIndex === undefined) {
    //   throw new Error('Account not found');
    // }
    // const signingResponse = await signIncomingSingleSigPSBT({
    //   transport,
    //   network: network.type,
    //   addressIndex,
    //   inputsToSign,
    //   psbtBase64,
    //   finalize: broadcast,
    // });
    // let txId: string = '';
    // if (request.payload.broadcast) {
    //   const txHex = psbtBase64ToHex(signingResponse);
    //   const response = await btcClient.sendRawTransaction(txHex);
    //   txId = response.tx.hash;
    // }
    // const signingMessage = {
    //   source: MESSAGE_SOURCE,
    //   method: ExternalSatsMethods.signPsbtResponse,
    //   payload: {
    //     signPsbtRequest: requestToken,
    //     signPsbtResponse: {
    //       psbtBase64: signingResponse,
    //       txId,
    //     },
    //   },
    // };
    // chrome.tabs.sendMessage(+tabId, signingMessage);
    // return {
    //   txId,
    //   signingResponse,
    // };
  };

  const handleConnectAndConfirm = async () => {
    // if (!selectedAccount) {
    //   console.error('No account selected');
    //   return;
    // }
    // setIsButtonDisabled(true);
    // const transport = await Transport.create();
    // if (!transport) {
    //   setIsConnectSuccess(false);
    //   setIsConnectFailed(true);
    //   setIsButtonDisabled(false);
    //   return;
    // }
    // setIsConnectSuccess(true);
    // await ledgerDelay(1500);
    // setCurrentStepIndex(1);
    // try {
    //   const response = await handleLedgerPsbtSigning(transport);
    //   if (payload.broadcast) {
    //     navigate('/tx-status', {
    //       state: {
    //         txid: response.txId,
    //         currency: 'BTC',
    //         error: '',
    //         browserTx: true,
    //       },
    //     });
    //   } else {
    //     window.close();
    //   }
    // } catch (err) {
    //   console.error(err);
    //   setIsTxRejected(true);
    // } finally {
    //   await transport.close();
    //   setIsButtonDisabled(false);
    // }
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectSuccess(false);
    setCurrentStepIndex(0);
  };

  const cancelCallback = () => {
    window.close();
  };

  const getSatsAmountString = (sats: BigNumber) => (
    <NumericFormat
      value={sats.toString()}
      displayType="text"
      thousandSeparator
      suffix={` ${t('SATS')}`}
    />
  );

  const totalNetAmount = parsedPsbts.reduce(
    (sum, psbt) => (psbt ? sum.plus(new BigNumber(psbt.netAmount)) : sum),
    new BigNumber(0),
  );

  const totalFees = parsedPsbts.reduce((sum, psbt) => {
    if (psbt && psbt.fees) {
      return sum.plus(new BigNumber(psbt.fees));
    }
    return sum;
  }, new BigNumber(0));
  const totalFeesInFiat = getBtcFiatEquivalent(totalFees, btcFiatRate);

  const shouldBroadcast = payload.psbts.every((psbt) => psbt && psbt.broadcast);

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      {userReceivesOrdinalArr.some((item) => item.loading) ? (
        <LoaderContainer>
          <MoonLoader color="white" size={50} />
        </LoaderContainer>
      ) : (
        <>
          <OuterContainer>
            {isLedgerAccount(selectedAccount) ? (
              <Container>
                <InfoContainer bodyText="External transaction requests are not yet supported on a Ledger account. Switch to a different account to sign transactions from the application." />
              </Container>
            ) : (
              <Container>
                <ReviewTransactionText>
                  {t('SIGN_TRANSACTIONS', { count: parsedPsbts.length })}
                </ReviewTransactionText>

                <BundleLinkContainer onClick={() => setReviewTransaction(true)}>
                  <BundleLinkText>{t('REVIEW_ALL')}</BundleLinkText>
                  <ArrowRight size={12} weight="bold" />
                </BundleLinkContainer>

                {!shouldBroadcast && (
                  <InfoContainer bodyText={t('PSBTS_NO_BROADCAST_DISCLAIMER')} />
                )}

                {userReceivesOrdinalArr?.map((userReceivesOrdinal, index) =>
                  userReceivesOrdinal.bundleItemsData?.map((bundleItem) => (
                    <BundleItemsComponent
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      item={bundleItem}
                      userReceivesOrdinal={userReceivesOrdinal.userReceivesOrdinal}
                    />
                  )),
                )}

                <RecipientComponent
                  value={`${satsToBtc(totalNetAmount).toString().replace('-', '')}`}
                  currencyType="BTC"
                  title={t('AMOUNT')}
                  heading={
                    totalNetAmount.isLessThan(0)
                      ? t('YOU_WILL_TRANSFER_IN_TOTAL')
                      : t('YOU_WILL_RECEIVE_IN_TOTAL')
                  }
                />

                <TransactionDetailComponent title={t('NETWORK')} value={network.type} />

                {shouldBroadcast && (
                  <TransactionDetailComponent
                    title={t('FEES')}
                    value={getSatsAmountString(totalFees)}
                    subValue={totalFeesInFiat}
                  />
                )}
                {hasOutputScript && <InfoContainer bodyText={t('SCRIPT_OUTPUT_TX')} />}
              </Container>
            )}
          </OuterContainer>
          <ButtonContainer>
            <TransparentButtonContainer>
              <ActionButton text={t('CANCEL')} transparent onPress={onCancelClick} />
            </TransparentButtonContainer>
            <ActionButton
              text={t('CONFIRM_ALL')}
              onPress={onSignPsbtConfirmed}
              processing={isSigning}
              disabled={isLedgerAccount(selectedAccount)}
            />
          </ButtonContainer>
        </>
      )}
      <CustomizedModal
        header=""
        visible={reviewTransaction}
        onClose={() => {
          setReviewTransaction(false);
          setCurrentPsbtIndex(0);
        }}
      >
        <CustomizedModalContent>
          <div>
            <ReviewTransactionText>
              {t('TRANSACTION')} {currentPsbtIndex + 1}/{parsedPsbts.length}
            </ReviewTransactionText>

            {userReceivesOrdinalArr[currentPsbtIndex]?.bundleItemsData?.map((bundleItem, index) => (
              <BundleItemsComponent
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                item={bundleItem}
                userReceivesOrdinal={userReceivesOrdinalArr[currentPsbtIndex].userReceivesOrdinal}
              />
            ))}

            <RecipientComponent
              value={`${satsToBtc(new BigNumber(parsedPsbts[currentPsbtIndex]?.netAmount))
                .toString()
                .replace('-', '')}`}
              currencyType="BTC"
              title={t('AMOUNT')}
              heading={
                parsedPsbts[currentPsbtIndex]?.netAmount < 0
                  ? t('YOU_WILL_TRANSFER')
                  : t('YOU_WILL_RECEIVE')
              }
            />

            <InputOutputComponent
              parsedPsbt={parsedPsbts[currentPsbtIndex]}
              isExpanded={expandInputOutputView}
              address={getSigningAddresses(payload.psbts[currentPsbtIndex].inputsToSign)}
              onArrowClick={expandInputOutputSection}
            />

            {payload.psbts[currentPsbtIndex].broadcast ? (
              <TransactionDetailComponent
                title={t('FEES')}
                value={getSatsAmountString(new BigNumber(parsedPsbts[currentPsbtIndex]?.fees))}
                subValue={getBtcFiatEquivalent(
                  new BigNumber(parsedPsbts[currentPsbtIndex]?.fees),
                  btcFiatRate,
                )}
              />
            ) : null}
            {hasOutputScript && <InfoContainer bodyText={t('SCRIPT_OUTPUT_TX')} />}
          </div>
          <TxReviewModalControls>
            {currentPsbtIndex > 0 && (
              <ActionButton
                text={t('PREVIOUS')}
                transparent
                onPress={() => {
                  setCurrentPsbtIndex((prevIndex) => prevIndex - 1);
                }}
                icon={<ArrowLeft color="white" size={16} weight="bold" />}
              />
            )}
            {currentPsbtIndex < parsedPsbts.length - 1 && (
              <ActionButton
                text={t('NEXT')}
                transparent
                onPress={() => {
                  setCurrentPsbtIndex((prevIndex) => prevIndex + 1);
                }}
                icon={<ArrowRight color="white" size={16} weight="bold" />}
                iconPosition="right"
              />
            )}
            {currentPsbtIndex === parsedPsbts.length - 1 && (
              <ActionButton
                text={t('DONE')}
                onPress={() => {
                  setReviewTransaction(false);
                  setCurrentPsbtIndex(0);
                }}
              />
            )}
          </TxReviewModalControls>
        </CustomizedModalContent>
      </CustomizedModal>
      <BottomModal header="" visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        {currentStepIndex === 0 && (
          <LedgerConnectionView
            title={signatureRequestTranslate('LEDGER.CONNECT.TITLE')}
            text={signatureRequestTranslate('LEDGER.CONNECT.SUBTITLE', { name: 'Bitcoin' })}
            titleFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_TITLE')}
            textFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_SUBTITLE')}
            imageDefault={ledgerConnectBtcIcon}
            isConnectSuccess={isConnectSuccess}
            isConnectFailed={isConnectFailed}
          />
        )}
        {currentStepIndex === 1 && (
          <LedgerConnectionView
            title={signatureRequestTranslate('LEDGER.CONFIRM.TITLE')}
            text={signatureRequestTranslate('LEDGER.CONFIRM.SUBTITLE')}
            titleFailed={signatureRequestTranslate('LEDGER.CONFIRM.ERROR_TITLE')}
            textFailed={signatureRequestTranslate('LEDGER.CONFIRM.ERROR_SUBTITLE')}
            imageDefault={ledgerConnectDefaultIcon}
            isConnectSuccess={isTxApproved}
            isConnectFailed={isTxRejected}
          />
        )}
        <SuccessActionsContainer>
          <ActionButton
            onPress={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
            text={signatureRequestTranslate(
              isTxRejected || isConnectFailed ? 'LEDGER.RETRY_BUTTON' : 'LEDGER.CONNECT_BUTTON',
            )}
            disabled={isButtonDisabled}
            processing={isButtonDisabled}
          />
          <ActionButton
            onPress={cancelCallback}
            text={signatureRequestTranslate('LEDGER.CANCEL_BUTTON')}
            transparent
          />
        </SuccessActionsContainer>
      </BottomModal>
    </>
  );
}

export default SignBatchPsbtRequest;
