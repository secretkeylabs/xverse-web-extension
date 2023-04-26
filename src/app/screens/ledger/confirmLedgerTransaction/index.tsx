import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { animated, useTransition } from '@react-spring/web';
import Transport from '@ledgerhq/hw-transport-webusb';
import ActionButton from '@components/button';
import {
  broadcastRawBtcTransaction,
  broadcastSignedTransaction,
  signLedgerNestedSegwitBtcTransaction,
  signStxTransaction,
} from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import { LedgerTransactionType } from '../reviewLedgerBtcTransaction';
import useWalletSelector from '@hooks/useWalletSelector';
import { Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import { ledgerDelay } from '@common/utils/ledger';
import { getBtcTxStatusUrl, getStxTxStatusUrl } from '@utils/helper';
import FullScreenHeader from '@components/ledger/fullScreenHeader';

import LedgerConnectDefaultSVG from '@assets/img/ledger/ledger_connect_default.svg';
import CheckCircleSVG from '@assets/img/ledger/check_circle.svg';
import { StacksTransaction } from '@stacks/transactions';
import useNetworkSelector from '@hooks/useNetwork';
import useBtcClient from '@hooks/useBtcClient';

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

function ConfirmLedgerTransaction(): JSX.Element {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [txId, setTxId] = useState<string | undefined>(undefined);

  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState<boolean>(false);
  const [isConnectFailed, setIsConnectFailed] = useState<boolean>(false);
  const [isTxApproved, setIsTxApproved] = useState<boolean>(false);
  const [isTxRejected, setIsTxRejected] = useState<boolean>(false);

  const { t } = useTranslation('translation', { keyPrefix: 'LEDGER_CONFIRM_TRANSACTION_SCREEN' });
  const location = useLocation();
  const selectedNetwork = useNetworkSelector();

  const { network, selectedAccount } = useWalletSelector();

  const btcClient = useBtcClient();

  const {
    recipient,
    type,
    unsignedTx,
  }: {
    amount: BigNumber;
    recipient: Recipient;
    type: LedgerTransactionType;
    unsignedTx: StacksTransaction;
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

  const signAndBroadcastBtcTx = async (transport: Transport, accountId: number) => {
    try {
      const result = await signLedgerNestedSegwitBtcTransaction(
        transport,
        network.type,
        accountId,
        recipient
      );
      setIsTxApproved(true);
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
      const result = await signStxTransaction(transport, unsignedTx, accountId);
      setIsTxApproved(true);
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
    setCurrentStepIndex(1);

    switch (type) {
      case 'BTC':
        await signAndBroadcastBtcTx(transport as Transport, selectedAccount.id);
        break;
      case 'STX':
        await signAndBroadcastStxTx(transport as Transport, selectedAccount.id);
        break;
      case 'ORDINALS':
      default:
        break;
    }
  };

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
                  text={t('CONNECT.SUBTITLE')}
                  titleFailed={t('CONNECT.ERROR_TITLE')}
                  textFailed={t('CONNECT.ERROR_SUBTITLE')}
                  imageDefault={LedgerConnectDefaultSVG}
                  isConnectSuccess={isConnectSuccess}
                  isConnectFailed={isConnectFailed}
                />
              </div>
            ) : currentStepIndex === 1 ? (
              <div>
                <LedgerConnectionView
                  title={t('CONFIRM.TITLE')}
                  text={t('CONFIRM.SUBTITLE')}
                  titleFailed={t('CONFIRM.ERROR_TITLE')}
                  textFailed={t('CONFIRM.ERROR_SUBTITLE')}
                  imageDefault={LedgerConnectDefaultSVG}
                  isConnectSuccess={isTxApproved}
                  isConnectFailed={isTxRejected}
                />
              </div>
            ) : currentStepIndex === 2 ? (
              <TxConfirmedContainer>
                <img src={CheckCircleSVG} alt="Success" />
                <TxConfirmedTitle>{t('SUCCESS.TITLE')}</TxConfirmedTitle>
                <TxConfirmedDescription>{t('SUCCESS.SUBTITLE')}</TxConfirmedDescription>
              </TxConfirmedContainer>
            ) : null}
          </OnBoardingContentContainer>
          {currentStepIndex !== 2 ? (
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
