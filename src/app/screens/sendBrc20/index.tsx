import ActionButton from '@components/button';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useGetBrc20FungibleTokens } from '@hooks/queries/ordinals/useGetBrc20FungibleTokens';
import useCoinRates from '@hooks/queries/useCoinRates';
import useBtcClient from '@hooks/useBtcClient';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  createBrc20TransferOrder,
  ErrorCodes,
  getBtcFiatEquivalent,
  Recipient,
  signBtcTransaction,
} from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Brc20TransferForm from './brc20TransferForm';
import Brc20TransferInfo from './brc20TransferInfo';

const BRC20TokenTagContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: props.theme.spacing(3),
}));

const BRC20TokenTag = styled.div((props) => ({
  background: props.theme.colors.white_400,
  borderRadius: 40,
  width: 54,
  height: 19,
  padding: '2px 6px',
  h1: {
    ...props.theme.typography.body_bold_l,
    fontSize: 11,
    color: props.theme.colors.elevation0,
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
  const { btcAddress, ordinalsAddress, selectedAccount, network } = useWalletSelector();
  const { btcFiatRate } = useCoinRates();

  const { data: brc20CoinsList } = useGetBrc20FungibleTokens();
  const { getSeed } = useSeedVault();
  const [amountError, setAmountError] = useState('');
  const [amountToSend, setAmountToSend] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const location = useLocation();
  const btcClient = useBtcClient();

  const coinTicker = location.search ? location.search.split('coinTicker=')[1] : undefined;
  const fungibleToken =
    location.state?.fungibleToken || brc20CoinsList?.find((coin) => coin.ticker === coinTicker);

  const isSendButtonEnabled =
    amountToSend !== '' &&
    !Number.isNaN(Number(amountToSend)) &&
    !Number.isNaN(Number(fungibleToken.balance)) &&
    +amountToSend > 0 &&
    +amountToSend <= +fungibleToken.balance;
  const isActionButtonEnabled = showForm ? isSendButtonEnabled : true;

  useResetUserFlow('/send-brc20');

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

  const handleInscribeTransferOrder = async () => {
    try {
      const order = await createBrc20TransferOrder(
        fungibleToken.ticker,
        amountToSend,
        ordinalsAddress,
        btcClient,
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
      throw error;
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
      const seedPhrase = await getSeed();
      const data = await signBtcTransaction(
        recipients,
        btcAddress,
        selectedAccount?.id ?? 0,
        seedPhrase,
        btcClient,
        network.type,
      );
      navigate('/confirm-inscription-request', {
        state: {
          // !NOTE: Typing below is broken. Not going to fix as this page is deprecated.
          brcContent: (order.inscriptionRequest as any).files[0].dataURL,
          signedTxHex: data?.signedTx,
          recipientAddress: order.inscriptionRequest.charge.address,
          amount: order.inscriptionRequest.charge.amount.toString(),
          recipient: recipients,
          fiatAmount: order.inscriptionRequest.charge.fiat_value,
          fee: data?.fee,
          feePerVByte: data?.feePerVByte,
          fiatFee: getBtcFiatEquivalent(data?.fee, BigNumber(btcFiatRate)),
          total: data?.total,
          fiatTotal: getBtcFiatEquivalent(data?.total, BigNumber(btcFiatRate)),
        },
      });
    } catch (err) {
      if (Number(err) === ErrorCodes.InSufficientBalance) {
        setAmountError(t('SEND.ERRORS.INSUFFICIENT_BALANCE'));
      } else if (Number(err) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setAmountError(t('SEND.ERRORS.INSUFFICIENT_BALANCE_FEES'));
      } else setAmountError(`${err}`);

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
      <TopRow title={t('SEND_BRC20.SEND')} onClick={handleBackButtonClick} />
      <BRC20TokenTagContainer>
        <BRC20TokenTag>
          <h1>{t('SEND_BRC20.BRC20_TOKEN')}</h1>
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
      <SendButtonContainer enabled={isActionButtonEnabled}>
        <ActionButton
          text={
            showForm ? t('SEND_BRC20.SEND_NEXT_BUTTON') : t('SEND_BRC20.SEND_INFO_START_BUTTON')
          }
          processing={isCreatingOrder}
          onPress={handleNext}
          disabled={!isActionButtonEnabled}
        />
      </SendButtonContainer>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SendBrc20Screen;
