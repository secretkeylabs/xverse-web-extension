import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { animated, useTransition } from '@react-spring/web';
import Transport from '@ledgerhq/hw-transport-webusb';
import ActionButton from '@components/button';
import {
  broadcastSignedTransaction,
  signLedgerNativeSegwitBtcTransaction,
  signLedgerStxTransaction,
  signLedgerMixedBtcTransaction,
} from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import useWalletSelector from '@hooks/useWalletSelector';
import { Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import LedgerConnectionView, { ConnectLedgerContainer, ConnectLedgerText } from '@components/ledger/connectLedgerView';
import { ledgerDelay } from '@common/utils/ledger';
import { getBtcTxStatusUrl, getStxTxStatusUrl } from '@utils/helper';
import FullScreenHeader from '@components/ledger/fullScreenHeader';
import useBtcClient from '@hooks/useBtcClient';
import useNetworkSelector from '@hooks/useNetwork';
import { StacksTransaction } from '@stacks/transactions';
import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import CheckCircleSVG from '@assets/img/ledger/check_circle.svg';
import InfoIcon from '@assets/img/info.svg';
import ledgerConnectDoneIcon from '@assets/img/ledger/ledger_import_connect_done.svg';
import ledgerConnectFailIcon from '@assets/img/ledger/ledger_import_connect_fail.svg';
import checkmarkIcon from '@assets/img/checkmarkIcon.svg';

export type LedgerTransactionType = 'BTC' | 'STX' | 'ORDINALS';

const Container = styled.div`
  display: flex;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  flex-direction: column;
  flex: 1;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const OnBoardingContentContainer = styled(animated.div)((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'center',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

const SuccessActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(30),
}));

const TxConfirmedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  > :first-child {
    margin-bottom: 26px;
  }
`;
const TxConfirmedTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
}));

const TxConfirmedDescription = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[200],
}));

const InfoImage = styled.img`
  width: 64px;
  height: 64px;
`;

export const ConnectLedgerTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginBottom: props.theme.spacing(12),
}));

interface ConnectLedgerTextAdvancedProps {
  isCompleted?: boolean;
}
export const ConnectLedgerTextAdvanced = styled.p<ConnectLedgerTextAdvancedProps>((props) => ({
  ...props.theme.body_m,
  display: 'flex',
  alignItems: 'flex-start',
  color: props.isCompleted ? props.theme.colors.white[400] : props.theme.colors.white[200],
  width: '90%',
  ':last-child': {
    marginTop: props.theme.spacing(8),
  }
}));

const CheckmarkIcon = styled.img(props => `
  margin-top: ${props.theme.spacing(2)}px;
  margin-right: ${props.theme.spacing(3)}px;
`);

function ConfirmLedgerTransaction(): JSX.Element {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [txId, setTxId] = useState<string | undefined>(undefined);

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isTxApproved, setIsTxApproved] = useState(false);
  const [isFinalTxApproved, setIsFinalTxApproved] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);

  const { t } = useTranslation('translation', { keyPrefix: 'LEDGER_CONFIRM_TRANSACTION_SCREEN' });
  const location = useLocation();
  const selectedNetwork = useNetworkSelector();

  const { network, selectedAccount } = useWalletSelector();

  const btcClient = useBtcClient();

  const {
    recipient,
    type,
    unsignedTx,
    ordinalUtxo,
  }: {
    amount: BigNumber;
    recipient: Recipient;
    type: LedgerTransactionType;
    unsignedTx: StacksTransaction;
    ordinalUtxo: any;
  } = location.state;

  const transition = useTransition(currentStepIndex, {
    from: {
      x: 24,
      opacity: 0,
    },
    enter: {
      x: 0,
      opacity: 1,
    },
  });

  const signAndBroadcastOrdinalsTx = async (transport: Transport, accountId: number) => {
    try {
      const result = await signLedgerMixedBtcTransaction(
        transport,
        network.type,
        accountId,
        recipient,
        ordinalUtxo,
      );
      const {value: psbtCreatedValue} = await result.next();

      const {value: taprootSignedValue} = await result.next();
      setIsTxApproved(true);
      
      const {value: txHex} = await result.next();
      setIsFinalTxApproved(true);
      await ledgerDelay(1500);
      const transactionId = await btcClient.sendRawTransaction(txHex || taprootSignedValue);
      setTxId(transactionId.tx.hash);
      setCurrentStepIndex(2);
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
      setIsButtonDisabled(false);
    } finally {
      transport.close();
    }
  };

  const signAndBroadcastBtcTx = async (transport: Transport, accountId: number) => {
    try {
      const result = await signLedgerNativeSegwitBtcTransaction(
        transport,
        network.type,
        accountId,
        recipient,
      );
      setIsFinalTxApproved(true);
      await ledgerDelay(1500);
      const transactionId = await btcClient.sendRawTransaction(result);
      setTxId(transactionId.tx.hash);
      setCurrentStepIndex(2);
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
      setIsButtonDisabled(false);
    } finally {
      transport.close();
    }
  };

  const signAndBroadcastStxTx = async (transport: Transport, accountId: number) => {
    try {
      const result = await signLedgerStxTransaction(transport, unsignedTx, accountId);
      setIsFinalTxApproved(true);
      await ledgerDelay(1500);
      const transactionHash = await broadcastSignedTransaction(result, selectedNetwork);
      setTxId(transactionHash);
      setCurrentStepIndex(2);
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
      setIsButtonDisabled(false);
    } finally {
      transport.close();
    }
  };

  const handleConnectAndConfirm = async () => {
    if (!selectedAccount) {
      console.error('No account selected');
      return;
    }
    setIsButtonDisabled(true);

    const transport = await Transport.create();

    if (!transport) {
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
      setIsButtonDisabled(false);
      return;
    }

    setIsConnectSuccess(true);
    await ledgerDelay(1500);
    if (type === 'ORDINALS') {
      setCurrentStepIndex(0.5);
    } else {
      setCurrentStepIndex(1);
    }

    switch (type) {
      case 'BTC':
        await signAndBroadcastBtcTx(transport as Transport, selectedAccount.id);
        break;
      case 'STX':
        await signAndBroadcastStxTx(transport as Transport, selectedAccount.id);
        break;
      case 'ORDINALS':
        await signAndBroadcastOrdinalsTx(transport as Transport, selectedAccount.id);
        break;
      default:
        break;
    }
    await transport.close();
  };

  const goToConfirmationStep = () => {
    setCurrentStepIndex(1);
  }

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectSuccess(false);
    setCurrentStepIndex(0);
  };

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  const handleSeeTransaction = () => {
    if (!txId) {
      console.error('No txId found');
      return;
    }

    switch (type) {
      case 'BTC':
        window.open(getBtcTxStatusUrl(txId, network), '_blank', 'noopener,noreferrer');
        break;
      case 'STX':
        window.open(getStxTxStatusUrl(txId, network), '_blank', 'noopener,noreferrer');
        break;
      case 'ORDINALS':
        window.open(getBtcTxStatusUrl(txId, network), '_blank', 'noopener,noreferrer');
        break;
      default:
        break;
    }
  };

  return (
    <Container>
      <FullScreenHeader />
      {transition((style) => (
        <>
          <OnBoardingContentContainer style={style}>
            {currentStepIndex === 0 ? (
              <div>
                <LedgerConnectionView
                  title={t('CONNECT.TITLE')}
                  text={t('CONNECT.BTC_SUBTITLE')}
                  titleFailed={t('CONNECT.ERROR_TITLE')}
                  textFailed={t('CONNECT.BTC_ERROR_SUBTITLE')}
                  imageDefault={ledgerConnectDefaultIcon}
                  isConnectSuccess={isConnectSuccess}
                  isConnectFailed={isConnectFailed}
                />
              </div>
            ) : currentStepIndex === 0.5 ? (
              <div>
                <ConnectLedgerContainer>
                  <InfoImage
                    src={InfoIcon}
                    alt="external inputs warning"
                  />
                  <ConnectLedgerTitle>{t('EXTERNAL_INPUTS.TITLE')}</ConnectLedgerTitle>
                  <ConnectLedgerText>{t('EXTERNAL_INPUTS.SUBTITLE')}</ConnectLedgerText>
                </ConnectLedgerContainer>
              </div>
            ) : currentStepIndex === 1 ? (type === 'ORDINALS' ? (
              <ConnectLedgerContainer>
                <img
                  src={
                    !isFinalTxApproved
                      ? isTxRejected
                        ? ledgerConnectFailIcon
                        : ledgerConnectDefaultIcon
                      : ledgerConnectDoneIcon
                  }
                  alt="confirm tx on the ledger device"
                />
                <ConnectLedgerTitle>{!isFinalTxApproved && isTxRejected ? t('CONFIRM.ERROR_TITLE') : t('CONFIRM.TITLE')}</ConnectLedgerTitle>
                {!isFinalTxApproved && isTxRejected ? (
                  <ConnectLedgerText>{t('CONFIRM.ERROR_SUBTITLE')}</ConnectLedgerText>
                ) : (
                  <>
                    <ConnectLedgerTextAdvanced isCompleted={isTxApproved}>{isTxApproved ? <CheckmarkIcon src={checkmarkIcon} alt="" /> : '1. '}Confirm the Ordinal inscription transfer on your device.</ConnectLedgerTextAdvanced>
                    <ConnectLedgerTextAdvanced isCompleted={isFinalTxApproved}>{isFinalTxApproved ? <CheckmarkIcon src={checkmarkIcon} alt="" /> : '2. '}Confirm the payment of transaction fees from BTC payment address on your device.</ConnectLedgerTextAdvanced>
                  </>
                )}
              </ConnectLedgerContainer>
            ) : (
              <div>
                <LedgerConnectionView
                  title={t('CONFIRM.TITLE')}
                  text={t('CONFIRM.SUBTITLE')}
                  titleFailed={t('CONFIRM.ERROR_TITLE')}
                  textFailed={t('CONFIRM.ERROR_SUBTITLE')}
                  imageDefault={ledgerConnectDefaultIcon}
                  isConnectSuccess={isFinalTxApproved}
                  isConnectFailed={isTxRejected}
                />
              </div>
            )) : currentStepIndex === 2 ? (
              <TxConfirmedContainer>
                <img src={CheckCircleSVG} alt="Success" />
                <TxConfirmedTitle>{t('SUCCESS.TITLE')}</TxConfirmedTitle>
                <TxConfirmedDescription>{t('SUCCESS.SUBTITLE')}</TxConfirmedDescription>
              </TxConfirmedContainer>
            ) : null}
          </OnBoardingContentContainer>
          {currentStepIndex === 0.5 ? (
            <SuccessActionsContainer>
              <ActionButton
                onPress={goToConfirmationStep}
                text={t('CONTINUE_BUTTON')}
              />
            </SuccessActionsContainer>
          ) : currentStepIndex !== 2 ? (
            <SuccessActionsContainer>
              <ActionButton
                onPress={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
                text={t(isTxRejected || isConnectFailed ? 'RETRY_BUTTON' : 'CONNECT_BUTTON')}
                disabled={isButtonDisabled}
                processing={isButtonDisabled}
              />
              <ActionButton
                transparent
                onPress={handleClose}
                text={t('CANCEL_BUTTON')}
                disabled={isButtonDisabled}
              />
            </SuccessActionsContainer>
          ) : (
            <SuccessActionsContainer>
              <ActionButton onPress={handleClose} text={t('CLOSE_BUTTON')} />
              <ActionButton
                transparent
                onPress={handleSeeTransaction}
                text={t('SEE_TRANSACTION_BUTTON')}
              />
            </SuccessActionsContainer>
          )}
        </>
      ))}
    </Container>
  );
}

export default ConfirmLedgerTransaction;
