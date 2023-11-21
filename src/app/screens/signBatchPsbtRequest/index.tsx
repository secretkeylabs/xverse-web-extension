import { ExternalSatsMethods, MESSAGE_SOURCE } from '@common/types/message-types';
import { delay } from '@common/utils/ledger';
import AccountHeaderComponent from '@components/accountHeader';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import InputOutputComponent from '@components/confirmBtcTransactionComponent/inputOutputComponent';
import InfoContainer from '@components/infoContainer';
import LoadingTransactionStatus from '@components/loadingTransactionStatus';
import { ConfirmationStatus } from '@components/loadingTransactionStatus/circularSvgAnimation';
import RecipientComponent from '@components/recipientComponent';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useDetectOrdinalInSignPsbt from '@hooks/useDetectOrdinalInSignPsbt';
import useSignBatchPsbtTx from '@hooks/useSignBatchPsbtTx';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { parsePsbt, satsToBtc } from '@secretkeylabs/xverse-core';
import { isLedgerAccount } from '@utils/helper';
import { BundleItem } from '@utils/rareSats';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

interface TxResponse {
  txId: string;
  psbtBase64: string;
}

function SignBatchPsbtRequest() {
  const { btcAddress, ordinalsAddress, selectedAccount, network } = useWalletSelector();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const [expandInputOutputView, setExpandInputOutputView] = useState(false);
  const { payload, confirmSignPsbt, cancelSignPsbt, getSigningAddresses, requestToken } =
    useSignBatchPsbtTx();
  const [isSigning, setIsSigning] = useState(false);
  const [isSigningComplete, setIsSigningComplete] = useState(false);
  const [signingPsbtIndex, setSigningPsbtIndex] = useState(1);
  const [hasOutputScript, setHasOutputScript] = useState(false);
  const [currentPsbtIndex, setCurrentPsbtIndex] = useState(0);
  const [reviewTransaction, setReviewTransaction] = useState(false);
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const tabId = params.get('tabId') ?? '0';
  const handleOrdinalAndOrdinalInfo = useDetectOrdinalInSignPsbt();
  const [userReceivesOrdinalArr, setUserReceivesOrdinalArr] = useState<
    { bundleItemsData: BundleItem[]; userReceivesOrdinal: boolean }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const handlePsbtParsing = useCallback(
    (psbt: SignMultiplePsbtPayload, index: number) => {
      try {
        return parsePsbt(selectedAccount!, psbt.inputsToSign, psbt.psbtBase64, network.type);
      } catch (err) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            errorTitle: t('PSBT_CANT_PARSE_ERROR_TITLE'),
            error: t('PSBT_INDEX_CANT_PARSE_ERROR_DESCRIPTION', { index }),
            browserTx: true,
          },
        });
        return undefined;
      }
    },
    [selectedAccount, network.type],
  );

  const parsedPsbts = useMemo(
    () => payload.psbts.map(handlePsbtParsing),
    [handlePsbtParsing, payload.psbts],
  );

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

  const checkIfMismatch = () => {
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

    payload.psbts.forEach((psbt) => psbt.inputsToSign.forEach(checkAddressMismatch));
  };

  const checkIfUserReceivesOrdinals = async () => {
    try {
      const results = await Promise.all(parsedPsbts.map(handleOrdinalAndOrdinalInfo));
      setUserReceivesOrdinalArr(results);
    } catch {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          errorTitle: t('PSBT_CANT_PARSE_ERROR_TITLE'),
          error: t('PSBT_CANT_PARSE_ERROR_DESCRIPTION'),
          browserTx: true,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkIfUserReceivesOrdinals();
  }, []);

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
    try {
      if (isLedgerAccount(selectedAccount)) {
        // setIsModalVisible(true);
        return;
      }
      setIsSigning(true);

      const signedPsbts: TxResponse[] = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const psbt of payload.psbts) {
        // eslint-disable-next-line no-await-in-loop
        await delay(100);

        // eslint-disable-next-line no-await-in-loop
        const signedPsbt = await confirmSignPsbt(psbt);
        signedPsbts.push({
          txId: signedPsbt.txId,
          psbtBase64: signedPsbt.signingResponse,
        });

        if (payload.psbts.findIndex((item) => item === psbt) !== payload.psbts.length - 1) {
          setSigningPsbtIndex((prevIndex) => prevIndex + 1);
        }
      }

      setIsSigningComplete(true);
      setIsSigning(false);

      const signingMessage = {
        source: MESSAGE_SOURCE,
        method: ExternalSatsMethods.signBatchPsbtResponse,
        payload: {
          signBatchPsbtRequest: requestToken,
          signBatchPsbtResponse: signedPsbts,
        },
      };

      chrome.tabs.sendMessage(+tabId, signingMessage);
    } catch (err) {
      setIsSigning(false);
      setIsSigningComplete(false);

      if (err instanceof Error) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            errorTitle: t('PSBT_CANT_SIGN_ERROR_TITLE'),
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

  const totalNetAmount = parsedPsbts.reduce(
    (sum, psbt) => (psbt ? sum.plus(new BigNumber(psbt.netAmount)) : sum),
    new BigNumber(0),
  );

  const userReceivesOrdinals = userReceivesOrdinalArr
    .filter((item) => item.userReceivesOrdinal)
    .map((item) => item.bundleItemsData)
    .flat();

  const userTransfersOrdinals = userReceivesOrdinalArr
    .filter((item) => !item.userReceivesOrdinal)
    .map((item) => item.bundleItemsData)
    .flat();

  const signingStatus: ConfirmationStatus = isSigningComplete ? 'SUCCESS' : 'LOADING';

  if (isSigning || isSigningComplete) {
    return (
      <LoadingTransactionStatus
        status={signingStatus}
        resultTexts={{
          title: t('TRANSACTIONS_SIGNED'),
          description: '',
        }}
        loadingTexts={{
          title: `${t('SIGNING_TRANSACTIONS')} ${signingPsbtIndex}/${payload.psbts.length}...`,
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
      {isLoading ? (
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
