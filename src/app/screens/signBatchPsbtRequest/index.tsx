import { ExternalSatsMethods, MESSAGE_SOURCE } from '@common/types/message-types';
import AccountHeaderComponent from '@components/accountHeader';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import InputOutputComponent from '@components/confirmBtcTransactionComponent/inputOutputComponent';
import InfoContainer from '@components/infoContainer';
import LoadingTransactionStatus from '@components/loadingTransactionStatus';
import RecipientComponent from '@components/recipientComponent';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useDetectOrdinalInSignBatchPsbt from '@hooks/useDetectOrdinalInSignBatchPsbt';
import useSignBatchPsbtTx from '@hooks/useSignBatchPsbtTx';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { getBtcFiatEquivalent, parsePsbt, satsToBtc } from '@secretkeylabs/xverse-core';
import { isLedgerAccount } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useLocation, useNavigate } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import { SignMultiplePsbtPayload } from 'sats-connect';
import styled from 'styled-components';
import BundleItemComponent from '../signPsbtRequest/bundleItemsComponent';
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
  padding: props.theme.spacing(8),
  paddingTop: props.theme.spacing(12),
  paddingBottom: props.theme.spacing(20),
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
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100% !important;
  background-color: #181818 !important;
`;

const CustomizedModalContainer = styled(Container)`
  margin-top: 0;
`;

const TxReviewModalControls = styled.div((props) => ({
  display: 'flex',
  columnGap: props.theme.spacing(6),
  padding: props.theme.spacing(8),
  paddingTop: props.theme.spacing(12),
  paddingBottom: props.theme.spacing(20),
}));

function SignBatchPsbtRequest() {
  const { btcAddress, ordinalsAddress, selectedAccount, network, btcFiatRate } =
    useWalletSelector();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const [expandInputOutputView, setExpandInputOutputView] = useState(false);
  const {
    payload,
    confirmSignPsbt,
    broadcastPsbt,
    cancelSignPsbt,
    getSigningAddresses,
    requestToken,
  } = useSignBatchPsbtTx();
  const [isSigning, setIsSigning] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isBroadcastingComplete, setIsBroadcastingComplete] = useState(false);
  const [isSigningComplete, setIsSigningComplete] = useState(false);
  const [signingPsbtIndex, setSigningPsbtIndex] = useState(0);
  const [broadcastingPsbtIndex, setBroadcastingPsbtIndex] = useState(0);
  const [hasOutputScript, setHasOutputScript] = useState(false);
  const [currentPsbtIndex, setCurrentPsbtIndex] = useState(0);
  const [reviewTransaction, setReviewTransaction] = useState(false);
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const tabId = params.get('tabId') ?? '0';

  const handlePsbtParsing = useCallback(
    (item: SignMultiplePsbtPayload) => {
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
    if (!parsedPsbts?.length || parsedPsbts.some((psbt) => !psbt)) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          errorTitle: t('PSBT_CANT_PARSE_ERROR_TITLE'),
          error: t('PSBT_CANT_PARSE_ERROR_DESCRIPTION'),
          browserTx: true,
        },
      });
    }
    if (payload.network.type !== network.type) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: t('NETWORK_MISMATCH'),
          browserTx: true,
        },
      });
    }

    const checkAddressMismatch = (input) => {
      if (input.address !== btcAddress && input.address !== ordinalsAddress) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            error: t('ADDRESS_MISMATCH'),
            browserTx: true,
          },
        });
      }
    };

    payload.psbts.forEach((psbt) => psbt.inputsToSign.forEach(checkAddressMismatch));
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
    // TODO: Remove the delay for production
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    try {
      if (isLedgerAccount(selectedAccount)) {
        // setIsModalVisible(true);
        return;
      }
      setIsSigning(true);

      const signedPsbts: any[] = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const psbt of payload.psbts) {
        // eslint-disable-next-line no-await-in-loop
        await delay(5000);

        // eslint-disable-next-line no-await-in-loop
        const psbtBase64 = await confirmSignPsbt(psbt);
        signedPsbts.push({
          psbtBase64,
        });
        setSigningPsbtIndex((prevIndex) => prevIndex + 1);
      }

      setIsSigningComplete(true);
      setIsSigning(false);

      if (payload.broadcast) {
        setIsSigning(false);
        setIsBroadcasting(true);

        let index = 0;
        // eslint-disable-next-line no-restricted-syntax
        for (const psbt of payload.psbts) {
          // eslint-disable-next-line no-await-in-loop
          await delay(5000);

          // eslint-disable-next-line no-await-in-loop
          const txId = await broadcastPsbt(signedPsbts[index].psbtBase64);
          signedPsbts[index].txId = txId;
          index += 1;
          setBroadcastingPsbtIndex((prevIndex) => prevIndex + 1);
        }

        setIsBroadcastingComplete(true);
        setIsBroadcasting(false);
      }

      const signingMessage = {
        source: MESSAGE_SOURCE,
        method: ExternalSatsMethods.signBatchPsbtResponse,
        payload: {
          signBatchPsbtRequest: requestToken,
          signBatchPsbtResponse: signedPsbts,
        },
      };

      chrome.tabs.sendMessage(+tabId, signingMessage);

      setSigningPsbtIndex(0);
      setBroadcastingPsbtIndex(0);
    } catch (err) {
      setIsSigning(false);
      setIsBroadcasting(false);
      setIsSigningComplete(false);
      setIsBroadcastingComplete(false);
      setSigningPsbtIndex(0);
      setBroadcastingPsbtIndex(0);

      if (err instanceof Error) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            errorTitle: !payload.broadcast ? t('PSBT_CANT_SIGN_ERROR_TITLE') : '',
            error: err.message,
            browserTx: true,
          },
        });
      }
    }
  };

  const onCancelClick = async () => {
    cancelSignPsbt();
    window.close();
  };

  const expandInputOutputSection = () => {
    setExpandInputOutputView(!expandInputOutputView);
  };

  const closeCallback = () => {
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

  const userReceivesOrdinals = userReceivesOrdinalArr
    .filter((item) => item.userReceivesOrdinal)
    .map((item) => item.bundleItemsData)
    .flat();

  const userTransfersOrdinals = userReceivesOrdinalArr
    .filter((item) => !item.userReceivesOrdinal)
    .map((item) => item.bundleItemsData)
    .flat();

  const getSigningStatus = () => {
    if (isSigningComplete) {
      return 'SUCCESS';
    }

    return 'LOADING';
  };

  const getBroadcastingStatus = () => {
    if (isBroadcastingComplete) {
      return 'SUCCESS';
    }

    return 'LOADING';
  };

  if (isBroadcasting || isBroadcastingComplete) {
    return (
      <LoadingTransactionStatus
        status={getBroadcastingStatus()}
        resultTexts={{
          title: t('TRANSACTIONS_BROADCASTED'),
          description: '',
        }}
        loadingTexts={{
          title: `${t('BROADCASTING_TRANSACTIONS')} ${broadcastingPsbtIndex + 1}/${
            payload.psbts.length
          }...`,
          description: t('THIS_MAY_TAKE_A_FEW_MINUTES'),
        }}
        loadingPercentage={
          isBroadcastingComplete ? 1 : broadcastingPsbtIndex / payload.psbts.length
        }
        primaryAction={{ onPress: closeCallback, text: t('CLOSE') }}
        withLoadingBgCircle
      />
    );
  }

  if (isSigning || isSigningComplete) {
    return (
      <LoadingTransactionStatus
        status={getSigningStatus()}
        resultTexts={{
          title: t('TRANSACTIONS_SIGNED'),
          description: '',
        }}
        loadingTexts={{
          title: `${t('SIGNING_TRANSACTIONS')} ${signingPsbtIndex + 1}/${payload.psbts.length}...`,
          description: t('THIS_MAY_TAKE_A_FEW_MINUTES'),
        }}
        loadingPercentage={isSigningComplete ? 1 : signingPsbtIndex / payload.psbts.length}
        primaryAction={{ onPress: closeCallback, text: t('CLOSE') }}
        withLoadingBgCircle
      />
    );
  }

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

                {!payload.broadcast && (
                  <InfoContainer bodyText={t('PSBTS_NO_BROADCAST_DISCLAIMER')} />
                )}

                {userTransfersOrdinals.length > 0 && (
                  <BundleItemsComponent items={userReceivesOrdinals} />
                )}

                {userReceivesOrdinals.length > 0 && (
                  <BundleItemsComponent items={userReceivesOrdinals} userReceivesOrdinal />
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

                {payload.broadcast && (
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
        <OuterContainer>
          <CustomizedModalContainer>
            <ReviewTransactionText>
              {t('TRANSACTION')} {currentPsbtIndex + 1}/{parsedPsbts.length}
            </ReviewTransactionText>

            {userReceivesOrdinalArr[currentPsbtIndex]?.bundleItemsData?.map((bundleItem, index) => (
              <BundleItemComponent
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

            {payload.broadcast ? (
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
          </CustomizedModalContainer>
        </OuterContainer>
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
      </CustomizedModal>
    </>
  );
}

export default SignBatchPsbtRequest;
