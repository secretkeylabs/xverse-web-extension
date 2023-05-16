import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import TopRow from '@components/topRow';
import { StoreState } from '@stores/index';
import { getTicker } from '@utils/helper';
import BottomBar from '@components/tabBar';
import useNetworkSelector from '@hooks/useNetwork';
import styled from 'styled-components';
import ActionButton from '@components/button';
import { createBrc20TransferOrder } from '@secretkeylabs/xverse-core';

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
    btcAddress, ordinalsAddress
  } = useSelector(
    (state: StoreState) => state.walletState,
  );
  const [amountError, setAmountError] = useState('');
  const [amountToSend, setAmountToSend] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const location = useLocation();
  const { fungibleToken } = location.state;

  //   useEffect(() => {
  //     if (data) {
  //       navigate('/confirm-brc20', {
  //         state: {
  //           unsignedTx: data,
  //           amount: amountToSend.toString(),
  //           fungibleToken,
  //           recepientAddress,
  //         },
  //       });
  //     }
  //   }, [data]);

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
    if ((amountToSend !== '') || (amountToSend <= fungibleToken.balance)) { return true; }
    return false;
  };

  const onNextClicked = async () => {
    setIsCreatingOrder(true);
    const order = await createBrc20TransferOrder(fungibleToken.ticker, amountToSend, ordinalsAddress, btcAddress);
    console.log(order);
    setIsCreatingOrder(false);
  };

  return (
    <>
      <TopRow title={t('SEND')} onClick={handleBackButtonClick} />
      <Container>
        <RowContainer>
          <TitleText>{t('AMOUNT')}</TitleText>
          <BalanceText>{t('BALANCE')}:</BalanceText>
          <Text>{fungibleToken.balance}</Text>
        </RowContainer>
        <AmountInputContainer error={amountError !== ''}>
          <InputFieldContainer>
            <InputField value={amountToSend} placeholder="0" onChange={onInputChange} />
          </InputFieldContainer>
          <Text>{getTokenCurrency()}</Text>
        </AmountInputContainer>
      </Container>
      <SendButtonContainer enabled={checkIfEnableButton()}>
        <ActionButton text={t('NEXT')} processing={isCreatingOrder} onPress={onNextClicked} />
      </SendButtonContainer>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SendBrc20Screen;
