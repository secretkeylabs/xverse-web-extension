import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import ActionButton from '@components/button';
import useSignPsbtTx from '@hooks/useSignPsbtTx';
import useWalletSelector from '@hooks/useWalletSelector';
import { parsePsbt } from '@secretkeylabs/xverse-core/transactions/psbt';
import { useTranslation } from 'react-i18next';
import IconOrdinal from '@assets/img/transactions/ordinal.svg';
import styled from 'styled-components';
import {
  getBtcFiatEquivalent, satsToBtc,
} from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import InputOutputComponent from '@components/confirmBtcTransactionComponent/inputOutputComponent';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import AccountHeaderComponent from '@components/accountHeader';
import { useNavigate } from 'react-router-dom';
import RecipientComponent from '@components/recipientComponent';
import InfoContainer from '@components/infoContainer';
import { NumericFormat } from 'react-number-format';
import { MoonLoader } from 'react-spinners';
import useDetectOrdinalInSignPsbt from '@hooks/useDetectOrdinalInSignPsbt';
import { isLedgerAccount } from '@utils/helper';
import OrdinalDetailComponent from './ordinalDetailComponent';

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
}));

const TransparentButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(2),
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white[0],
  marginBottom: props.theme.spacing(12),
  textAlign: 'left',
}));

function SignPsbtRequest() {
  const {
    btcAddress, ordinalsAddress, selectedAccount, network, btcFiatRate,
  } = useWalletSelector();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const [expandInputOutputView, setExpandInputOutputView] = useState(false);
  const {
    payload, confirmSignPsbt, cancelSignPsbt, getSigningAddresses,
  } = useSignPsbtTx();
  const [isSigning, setIsSigning] = useState(false);

  const handlePsbtParsing = useCallback(() => {
    try {
      return parsePsbt(selectedAccount!, payload.inputsToSign, payload.psbtBase64, network.type);
    } catch (err) {
      return '';
    }
  }, [selectedAccount, payload.psbtBase64]);

  const parsedPsbt = useMemo(() => handlePsbtParsing(), [handlePsbtParsing]);
  const {
    loading,
    ordinalInfoData,
    userReceivesOrdinal,
  } = useDetectOrdinalInSignPsbt(parsedPsbt);
  const signingAddresses = useMemo(
    () => getSigningAddresses(payload.inputsToSign),
    [payload.inputsToSign],
  );

  const checkIfMismatch = () => {
    if (!parsedPsbt) {
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
    if (payload.inputsToSign) {
      payload.inputsToSign.forEach((input) => {
        if (input.address !== btcAddress && input.address !== ordinalsAddress) {
          navigate('/tx-status', {
            state: {
              txid: '',
              currency: 'STX',
              error: t('ADDRESS_MISMATCH'),
              browserTx: true,
            },
          });
        }
      });
    }
  };

  useEffect(() => {
    checkIfMismatch();
  }, []);

  const onSignPsbtConfirmed = async () => {
    try {
      if (isLedgerAccount(selectedAccount)) {
        return;
      }

      setIsSigning(true);
      const response = await confirmSignPsbt();
      setIsSigning(false);
      if (payload.broadcast) {
        navigate('/tx-status', {
          state: {
            txid: response.txId,
            currency: 'BTC',
            error: '',
            browserTx: true,
          },
        });
      } else {
        window.close();
      }
    } catch (err) {
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

  const getSatsAmountString = (sats: BigNumber) => (
    <NumericFormat
      value={sats.toString()}
      displayType="text"
      thousandSeparator
      suffix={` ${t('SATS')}`}
    />
  );

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch disableCopy />
      {loading ? (
        <LoaderContainer>
          <MoonLoader color="white" size={50} />
        </LoaderContainer>
      )
        : (
          <>
            <OuterContainer>
              {isLedgerAccount(selectedAccount) ? (
                <Container>
                  <InfoContainer bodyText="External transaction requests are not yet supported on a Ledger account. Switch to a different account to sign transactions from the application." />
                </Container>
              ) : (
                <Container>
                  <ReviewTransactionText>{t('REVIEW_TRANSACTION')}</ReviewTransactionText>
                  {!payload.broadcast && (
                    <InfoContainer bodyText={t('PSBT_NO_BROADCAST_DISCLAIMER')} />
                  )}
                  {ordinalInfoData && ordinalInfoData.map((ordinalData) => (
                    <OrdinalDetailComponent
                      ordinalInscription={`Inscription ${ordinalData?.number}`}
                      icon={IconOrdinal}
                      title={t('ORDINAL')}
                      ordinal={ordinalData}
                      ordinalDetail={ordinalData?.content_type}
                      heading={userReceivesOrdinal ? t('YOU_WILL_RECEIVE') : t('YOU_WILL_TRANSFER')}
                    />
                  ))}
                  <RecipientComponent
                    value={`${satsToBtc(new BigNumber(parsedPsbt?.netAmount))
                      .toString()
                      .replace('-', '')}`}
                    currencyType="BTC"
                    title={t('AMOUNT')}
                    heading={parsedPsbt?.netAmount < 0 ? t('YOU_WILL_TRANSFER') : t('YOU_WILL_RECEIVE')}
                  />
                  <InputOutputComponent
                    parsedPsbt={parsedPsbt}
                    isExpanded={expandInputOutputView}
                    address={signingAddresses}
                    onArrowClick={expandInputOutputSection}
                  />

                  <TransactionDetailComponent title={t('NETWORK')} value={network.type} />
                  {payload.broadcast ? (
                    <TransactionDetailComponent
                      title={t('FEES')}
                      value={getSatsAmountString(new BigNumber(parsedPsbt?.fees))}
                      subValue={getBtcFiatEquivalent(new BigNumber(parsedPsbt?.fees), btcFiatRate)}
                    />
                  ) : null}
                </Container>
              )}
            </OuterContainer>
            <ButtonContainer>
              <TransparentButtonContainer>
                <ActionButton text={t('CANCEL')} transparent onPress={onCancelClick} />
              </TransparentButtonContainer>
              <ActionButton text={t('CONFIRM')} onPress={onSignPsbtConfirmed} processing={isSigning} disabled={isLedgerAccount(selectedAccount)} />
            </ButtonContainer>
          </>
        )}
    </>
  );
}

export default SignPsbtRequest;
