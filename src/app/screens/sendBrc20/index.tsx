import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  createBrc20TransferOrder,
  getBtcFiatEquivalent,
  signBtcTransaction,
  ErrorCodes,
} from '@secretkeylabs/xverse-core';
import { Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import TopRow from '@components/topRow';
import BottomBar from '@components/tabBar';
import ActionButton from '@components/button';
import Brc20TransferForm from './brc20TransferForm';
import Brc20TransferInfo from './brc20TransferInfo';

const BRC20TokenTagContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: 6,
});

const BRC20TokenTag = styled.div((props) => ({
  background: props.theme.colors.white[400],
  borderRadius: 40,
  width: 54,
  height: 19,
  padding: '2px 6px',
  h1: {
    ...props.theme.body_bold_l,
    fontSize: 11,
    color: props.theme.colors.background.elevation0,
  },
}));

interface ButtonProps {
  enabled: boolean;
}

const SendButtonContainer = styled.div<ButtonProps>((props) => ({
  paddingBottom: props.theme.spacing(12),
  paddingTop: props.theme.spacing(4),
  marginLeft: '5%',
  marginRight: '5%',
  opacity: props.enabled ? 1 : 0.6,
}));

function SendBrc20Screen() {
  const { t } = useTranslation('translation');
  const navigate = useNavigate();
  const {
    btcAddress, ordinalsAddress, selectedAccount, seedPhrase, network, btcFiatRate, brcCoinsList
  } = useWalletSelector();
  const [amountError, setAmountError] = useState('');
  const [amountToSend, setAmountToSend] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const location = useLocation();

  const coinName = location.search ? location.search.split('coinName=')[1] : undefined;
  const fungibleToken = location.state?.fungibleToken || brcCoinsList?.find((coin) => coin.name === coinName);

  const { subscribeToResetUserFlow } = useResetUserFlow();
  useEffect(() => subscribeToResetUserFlow('/send-brc20'), []);

  const handleBackButtonClick = () => {
    if (showForm) {
      setAmountError('');
      setAmountToSend('');
      setShowForm(false);
    } else {
      navigate(-1);
    }
  };

  const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    const resultRegex = /^\d*\.?\d*$/;
    if (!resultRegex.test(newValue)) {
      setAmountToSend('');
    } else {
      setAmountToSend(newValue);
    }
  };

  const checkIfEnableButton = () => {
    if (amountToSend !== '' || amountToSend <= fungibleToken.balance) {
      return true;
    }
    return false;
  };

  const handleInscribeTransferOrder = async () => {
    try {
      const order = await createBrc20TransferOrder(
        fungibleToken.ticker,
        amountToSend,
        ordinalsAddress,
      );
      if ((order.inscriptionRequest as any).error) {
        throw new Error((order.inscriptionRequest as any).error);
      }
      return order;
    } catch (error) {
      if (error instanceof Error) {
        setAmountError(error.message);
      } else {
        console.log('Unexpected error', error);
      }
      return Promise.reject(error);
    }
  };

  const validateBrcAmount = () => {
    if (+amountToSend > fungibleToken.balance) {
      setAmountError(t('SEND.ERRORS.INSUFFICIENT_BALANCE'));
      throw new Error(t('SEND.ERRORS.INSUFFICIENT_BALANCE'));
    }
    if (!amountToSend || +amountToSend === 0) {
      setAmountError(t('SEND.ERRORS.AMOUNT_REQUIRED'));
      throw new Error(t('SEND.ERRORS.AMOUNT_REQUIRED'));
    }
  };

  const createTransferRequest = async () => {
    try {
      setIsCreatingOrder(true);
      validateBrcAmount();
      const order = await handleInscribeTransferOrder();
      const orderAmount = new BigNumber(order.inscriptionRequest.charge.amount);
      const recipients: Recipient[] = [
        {
          address: order.inscriptionRequest.charge.address,
          amountSats: orderAmount,
        },
      ];
      const data = await signBtcTransaction(
        recipients,
        btcAddress,
        selectedAccount?.id ?? 0,
        seedPhrase,
        network.type,
      ).catch((err) => {
        if (Number(err) === ErrorCodes.InSufficientBalance) {
          setAmountError(t('SEND.ERRORS.INSUFFICIENT_BALANCE'));
        } else if (Number(err) === ErrorCodes.InSufficientBalanceWithTxFee) {
          setAmountError(t('SEND.ERRORS.INSUFFICIENT_BALANCE_FEES'));
        } else setAmountError(err.toString());
      });
      navigate('/confirm-inscription-request', {
        state: {
          brcContent: order.inscriptionRequest.files[0].dataURL,
          signedTxHex: data?.signedTx,
          recipientAddress: order.inscriptionRequest.charge.address,
          amount: order.inscriptionRequest.charge.amount.toString(),
          recipient: recipients,
          fiatAmount: order.inscriptionRequest.charge.fiat_value,
          fee: data?.fee,
          feePerVByte: data?.feePerVByte,
          fiatFee: getBtcFiatEquivalent(data?.fee, btcFiatRate),
          total: data?.total,
          fiatTotal: getBtcFiatEquivalent(data?.total, btcFiatRate),
        },
      });
    } catch (err) {
      setIsCreatingOrder(false);
    }
  };

  const handleNext = async () => {
    if (!showForm) {
      setShowForm(true);
    } else {
      await createTransferRequest();
    }
  };

  return (
    <>
      <TopRow title={t('SEND_BRC_20.SEND')} onClick={handleBackButtonClick} />
      <BRC20TokenTagContainer>
        <BRC20TokenTag>
          <h1>{t('SEND_BRC_20.BRC20_TOKEN')}</h1>
        </BRC20TokenTag>
      </BRC20TokenTagContainer>
      {showForm ? (
        <Brc20TransferForm
          amountToSend={amountToSend}
          onAmountChange={onInputChange}
          amountError={amountError}
          token={fungibleToken}
        />
      ) : (
        <Brc20TransferInfo />
      )}
      <SendButtonContainer enabled={checkIfEnableButton()}>
        <ActionButton
          text={
            showForm ? t('SEND_BRC_20.SEND_NEXT_BUTTON') : t('SEND_BRC_20.SEND_INFO_START_BUTTON')
          }
          processing={isCreatingOrder}
          onPress={handleNext}
        />
      </SendButtonContainer>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SendBrc20Screen;
