import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectBtcIcon from '@assets/img/ledger/ledger_import_connect_btc.svg';
import { ExternalSatsMethods, MESSAGE_SOURCE } from '@common/types/message-types';
import { ledgerDelay } from '@common/utils/ledger';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import useBtcClient from '@hooks/useBtcClient';
import useWalletSelector from '@hooks/useWalletSelector';
import Transport from '@ledgerhq/hw-transport-webusb';
import { FastForward } from '@phosphor-icons/react';
import {
  Brc20HistoryTransactionData,
  BtcTransactionData,
  signIncomingSingleSigPSBT,
} from '@secretkeylabs/xverse-core';
import { Transport as TransportType } from '@secretkeylabs/xverse-core/ledger/types';
import { psbtBase64ToHex } from '@secretkeylabs/xverse-core/transactions/psbt';
import { getBtcTxStatusUrl, isLedgerAccount } from '@utils/helper';
import { isBtcTransaction } from '@utils/transactions/transactions';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import TransactionAmount from './transactionAmount';
import TransactionRecipient from './transactionRecipient';
import TransactionStatusIcon from './transactionStatusIcon';
import TransactionTitle from './transactionTitle';

const TransactionContainer = styled.button((props) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: props.theme.spacing(5),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  background: 'none',
  ':hover': {
    background: props.theme.colors.white_900,
  },
  ':focus': {
    background: props.theme.colors.white_850,
  },
}));

const TransactionAmountContainer = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  flex: 1,
});

const TransactionInfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(6),
  flex: 1,
}));

const TransactionRow = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  ...props.theme.typography.body_bold_m,
}));

const StyledButton = styled(ActionButton)((props) => ({
  padding: 0,
  border: 'none',
  width: 'auto',
  height: 'auto',
  div: {
    ...props.theme.typography.body_medium_m,
    color: props.theme.colors.tangerine,
  },
  ':hover:enabled': {
    backgroundColor: 'transparent',
  },
  ':active:enabled': {
    backgroundColor: 'transparent',
  },
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

interface TransactionHistoryItemProps {
  transaction: BtcTransactionData | Brc20HistoryTransactionData;
}
export default function BtcTransactionHistoryItem({ transaction }: TransactionHistoryItemProps) {
  const navigate = useNavigate();
  const { network, selectedAccount } = useWalletSelector();
  const isBtc = isBtcTransaction(transaction) ? 'BTC' : 'brc20';
  const theme = useTheme();
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isTxApproved, setIsTxApproved] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);
  const btcClient = useBtcClient();

  const openBtcTxStatusLink = useCallback(() => {
    window.open(getBtcTxStatusUrl(transaction.txid, network), '_blank', 'noopener,noreferrer');
  }, []);

  const submitTransaction = () => {
    if (isLedgerAccount(selectedAccount)) {
      setIsModalVisible(true);
    }
  };

  const handleLedgerPsbtSigning = async (transport: TransportType) => {
    const addressIndex = selectedAccount?.deviceAccountIndex;

    if (addressIndex === undefined) {
      throw new Error('Account not found');
    }

    // TODO: Update this to sign BTC / BRC-20 transactions
    // const signingResponse = await signIncomingSingleSigPSBT({
    //   transport,
    //   network: network.type,
    //   addressIndex,
    //   inputsToSign,
    //   psbtBase64,
    //   finalize: true,
    // });
    // let txId = '';
    // const txHex = psbtBase64ToHex(signingResponse);
    // const response = await btcClient.sendRawTransaction(txHex);
    // txId = response.tx.hash;

    // return {
    //   txId,
    //   signingResponse,
    // };

    return {
      // TODO: Remove this when the above is implemented
      txId: '',
      signingResponse: '',
    };
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
    }
    setIsConnectSuccess(true);
    await ledgerDelay(1500);
    setCurrentStepIndex(1);
    try {
      const response = await handleLedgerPsbtSigning(transport);
      navigate('/tx-status', {
        state: {
          txid: response.txId,
          currency: 'BTC',
          error: '',
          browserTx: true,
        },
      });
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
    } finally {
      await transport.close();
      setIsButtonDisabled(false);
    }
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectSuccess(false);
    setCurrentStepIndex(0);
  };

  const cancelCallback = () => {
    setIsModalVisible(false);
  };

  const showAccelerateButton =
    transaction.txStatus === 'pending' &&
    !transaction.incoming &&
    (transaction.txType === 'bitcoin' ||
      transaction.txType === 'brc20' ||
      ('isOrdinal' in transaction && transaction.isOrdinal));

  return (
    <>
      <TransactionContainer onClick={openBtcTxStatusLink}>
        <TransactionStatusIcon transaction={transaction} currency={isBtc} />
        <TransactionInfoContainer>
          <TransactionRow>
            <div>
              <TransactionTitle transaction={transaction} />
              <TransactionRecipient transaction={transaction} />
            </div>
            <TransactionAmountContainer>
              <TransactionAmount transaction={transaction} coin={isBtc} />
              {showAccelerateButton && (
                <Link to={`/speed-up-tx/${transaction.txid}`}>
                  <StyledButton
                    transparent
                    text={t('SPEED_UP')}
                    onPress={(e) => {
                      e.stopPropagation();
                    }}
                    icon={<FastForward size={16} color={theme.colors.tangerine} weight="fill" />}
                    iconPosition="right"
                  />
                </Link>
              )}
            </TransactionAmountContainer>
          </TransactionRow>
        </TransactionInfoContainer>
      </TransactionContainer>

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
