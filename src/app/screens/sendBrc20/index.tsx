import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import TopRow from '@components/topRow';
import { getTicker } from '@utils/helper';
import BottomBar from '@components/tabBar';
import styled from 'styled-components';
import ActionButton from '@components/button';
import {
  createBrc20TransferOrder,
  getBtcFiatEquivalent,
  signBtcTransaction,
  ErrorCodes,
} from '@secretkeylabs/xverse-core';
import { Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import BigNumber from 'bignumber.js';
import InfoContainer from '@components/infoContainer';
import TokenImage from '@components/tokenImage';
import useWalletSelector from '@hooks/useWalletSelector';

const Container = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  marginTop: props.theme.spacing(16),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const BRC20TokenTagContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: 6,
});

const TokenContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(8),
}));

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

interface ContainerProps {
  error: boolean;
}

const AmountInputContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
  border: props.error
    ? '1px solid rgba(211, 60, 60, 0.3)'
    : `1px solid ${props.theme.colors.background.elevation3}`,
  backgroundColor: props.theme.colors.background['elevation-1'],
  borderRadius: 8,
  paddingLeft: props.theme.spacing(5),
  paddingRight: props.theme.spacing(5),
  height: 44,
  ':focus-within': {
    border: `1px solid ${props.theme.colors.background.elevation6}`,
  },
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  flex: 1,
  display: 'flex',
}));

const InputFieldContainer = styled.div(() => ({
  flex: 1,
}));

const InputField = styled.input((props) => ({
  ...props.theme.body_m,
  backgroundColor: props.theme.colors.background['elevation-1'],
  color: props.theme.colors.white['0'],
  width: '100%',
  border: 'transparent',
}));

const Text = styled.h1((props) => ({
  ...props.theme.body_medium_m,
}));

const BalanceText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['400'],
  marginRight: props.theme.spacing(2),
}));

const ErrorContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(3),
}));

const ErrorText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.feedback.error,
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
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();
  const {
    btcAddress, ordinalsAddress, selectedAccount, seedPhrase, network, btcFiatRate,
  } = useWalletSelector();
  const [amountError, setAmountError] = useState('');
  const [amountToSend, setAmountToSend] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const location = useLocation();
  const { fungibleToken } = location.state;

  const handleBackButtonClick = () => {
    navigate('/');
  };

  function getTokenCurrency() {
    if (fungibleToken) {
      if (fungibleToken?.ticker) {
        return fungibleToken.ticker.toUpperCase();
      }
      if (fungibleToken?.name) {
        return getTicker(fungibleToken.name).toUpperCase();
      }
    }
  }

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
      throw new Error(t('ERRORS.INSUFFICIENT_BALANCE'));
    }
    if (!amountToSend || +amountToSend === 0) {
      throw new Error(t('ERRORS.AMOUNT_REQUIRED'));
    }
  };

  const onNextClicked = async () => {
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
          setAmountError(t('ERRORS.INSUFFICIENT_BALANCE'));
        } else if (Number(err) === ErrorCodes.InSufficientBalanceWithTxFee) {
          setAmountError(t('ERRORS.INSUFFICIENT_BALANCE_FEES'));
        } else setAmountError(err.toString());
      });
      navigate('/confirm-btc-tx', {
        state: {
          signedTxHex: data?.signedTx,
          recipientAddress: order.inscriptionRequest.charge.address,
          amount: order.inscriptionRequest.charge.amount.toString(),
          recipient: recipients,
          fiatAmount: getBtcFiatEquivalent(orderAmount, btcFiatRate),
          fee: data?.fee,
          fiatFee: getBtcFiatEquivalent(data?.fee, btcFiatRate),
          total: data?.total,
          fiatTotal: getBtcFiatEquivalent(data?.total, btcFiatRate),
          isBrc20TokenFlow: true,
        },
      });
    } catch (err) {
      if (err instanceof Error) {
        setAmountError(err.message);
      } else {
        console.log('Unexpected error', err);
      }
      setIsCreatingOrder(false);
    }
  };

  return (
    <>
      <TopRow title={t('SEND')} onClick={handleBackButtonClick} />
      <BRC20TokenTagContainer>
        <BRC20TokenTag>
          <h1>{t('BRC20_TOKEN')}</h1>
          {' '}
        </BRC20TokenTag>
      </BRC20TokenTagContainer>
      <TokenContainer>
        <TokenImage
          token="FT"
          loading={false}
          fungibleToken={fungibleToken || undefined}
        />
      </TokenContainer>
      <Container>
        <RowContainer>
          <TitleText>{t('AMOUNT')}</TitleText>
          <BalanceText>
            {t('BALANCE')}
            :
          </BalanceText>
          <Text>{fungibleToken.balance}</Text>
        </RowContainer>
        <AmountInputContainer error={amountError !== ''}>
          <InputFieldContainer>
            <InputField value={amountToSend} placeholder="0" onChange={onInputChange} />
          </InputFieldContainer>
          <Text>{getTokenCurrency()}</Text>
        </AmountInputContainer>
        <ErrorContainer>
          <ErrorText>{amountError}</ErrorText>
        </ErrorContainer>
        <div style={{ marginTop: 16 }}>
          <InfoContainer bodyText="To transfer BRC-20 tokens, you must first inscribe the transfer and then send the inscription to your recipient." />
        </div>
      </Container>
      <SendButtonContainer enabled={checkIfEnableButton()}>
        <ActionButton text={t('NEXT')} processing={isCreatingOrder} onPress={onNextClicked} />
      </SendButtonContainer>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SendBrc20Screen;
