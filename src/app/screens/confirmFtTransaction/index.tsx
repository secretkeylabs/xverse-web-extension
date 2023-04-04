import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StacksTransaction } from '@secretkeylabs/xverse-core/types';
import { broadcastSignedTransaction } from '@secretkeylabs/xverse-core/transactions';
import BottomBar from '@components/tabBar';
import RecipientAddressView from '@components/recipinetAddressView';
import TransferAmountView from '@components/transferAmountView';
import ConfirmStxTransationComponent from '@components/confirmStxTransactionComponent';
import TopRow from '@components/topRow';
import BigNumber from 'bignumber.js';
import useNetworkSelector from '@hooks/useNetwork';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useWalletSelector from '@hooks/useWalletSelector';

const InfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(12),
  paddingBottom: props.theme.spacing(12),
  borderBottom: `1px solid ${props.theme.colors.background.elevation3}`,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  textTransform: 'uppercase',
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginTop: props.theme.spacing(2),
  wordBreak: 'break-all',
}));

function ConfirmFtTransaction() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const navigate = useNavigate();
  const selectedNetwork = useNetworkSelector();
  const location = useLocation();
  const { unsignedTx, amount, fungibleToken, memo, recepientAddress } = location.state;
  const { refetch } = useStxWalletData();

  const { network } = useWalletSelector();

  const {
    isLoading,
    error: txError,
    data: stxTxBroadcastData,
    mutate,
  } = useMutation<string, Error, { signedTx: StacksTransaction }>(async ({ signedTx }) =>
    broadcastSignedTransaction(signedTx, selectedNetwork)
  );

  useEffect(() => {
    if (stxTxBroadcastData) {
      navigate('/tx-status', {
        state: {
          txid: stxTxBroadcastData,
          currency: 'STX',
          error: '',
        },
      });
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  }, [stxTxBroadcastData]);

  useEffect(() => {
    if (txError) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          error: txError.toString(),
        },
      });
    }
  }, [txError]);

  const handleOnConfirmClick = (txs: StacksTransaction[]) => {
    mutate({ signedTx: txs[0] });
  };

  const handleBackButtonClick = () => {
    navigate('/send-ft', {
      state: {
        recipientAddress: recepientAddress,
        amountToSend: amount.toString(),
        stxMemo: memo,
        fungibleToken,
      },
    });
  };

  return (
    <>
      <TopRow title={t('CONFIRM_TX')} onClick={handleBackButtonClick} />
      <ConfirmStxTransationComponent
        initialStxTransactions={[unsignedTx]}
        loading={isLoading}
        onConfirmClick={handleOnConfirmClick}
        onCancelClick={handleBackButtonClick}
      >
        <TransferAmountView
          currency="FT"
          amount={new BigNumber(amount)}
          fungibleToken={fungibleToken}
        />
        <RecipientAddressView recipient={recepientAddress} />
        <InfoContainer>
          <TitleText>{t('NETWORK')}</TitleText>
          <ValueText>{network.type}</ValueText>
        </InfoContainer>
        {!!memo && (
          <InfoContainer>
            <TitleText>{t('MEMO')}</TitleText>
            <ValueText>{memo}</ValueText>
          </InfoContainer>
        )}
      </ConfirmStxTransationComponent>
      <BottomBar tab="dashboard" />
    </>
  );
}
export default ConfirmFtTransaction;
