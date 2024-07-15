import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowRight } from '@phosphor-icons/react';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Theme from 'theme';
import AmountInput from './components/amountInput';
import RouteItem from './components/routeItem';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: `0 ${props.theme.space.m} ${props.theme.space.l} ${props.theme.space.m}`,
}));

const Flex1 = styled.div((props) => ({
  flex: 1,
}));

const RouteContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: `${props.theme.space.l} 0`,
}));

const SwapButtonContainer = styled.button((props) => ({
  display: 'flex',
  background: props.theme.colors.white_0,
  padding: props.theme.space.xs,
  alignSelf: 'flex-end',
  borderRadius: props.theme.space.xxl,
  marginBottom: props.theme.space.xs,
  ':hover': {
    opacity: 0.8,
  },
}));

const SendButtonContainer = styled.div((props) => ({
  marginTop: props.theme.space.l,
}));

export default function SwapScreen() {
  const [amount, setAmount] = useState('');

  const { fiatCurrency } = useWalletSelector();
  const navigate = useNavigate();
  const { t } = useTranslation('translation');
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const defaultFrom = params.get('from');

  const handleGoBack = () => {
    navigate(-1);
  };

  const getQuotes = () => {
    // TODO: implement getQuotes
  };

  const onClickFrom = () => {
    // TODO: implement from bottomsheet
  };

  const onClickTo = () => {
    // TODO: implement from bottomsheet
  };

  const onClickSwapRoute = () => {
    // TODO: implement swap route
  };

  const isGetQuotesDisabled = false;
  const isError = false;
  const isGetQuotesLoading = false;

  return (
    <>
      <TopRow onClick={handleGoBack} />
      <Container>
        <StyledP typography="headline_s" color="white_0">
          {t('SWAP_SCREEN.SWAP')}
        </StyledP>
        <Flex1>
          <RouteContainer>
            <RouteItem label={t('SWAP_SCREEN.FROM')} onClick={onClickFrom} />
            <SwapButtonContainer onClick={onClickSwapRoute}>
              <ArrowRight size={16} weight="bold" color={Theme.colors.elevation0} />
            </SwapButtonContainer>
            <RouteItem label={t('SWAP_SCREEN.TO')} onClick={onClickTo} />
          </RouteContainer>
          <AmountInput
            label={t('SWAP_CONFIRM_SCREEN.AMOUNT')}
            input={{
              value: amount,
              onChange: (value: string) => setAmount(value),
              fiatValue: '0',
              fiatCurrency,
            }}
            max={{ isDisabled: false, onClick: () => {} }}
            balance="0"
          />
        </Flex1>
        <SendButtonContainer>
          <Button
            disabled={isGetQuotesDisabled}
            variant={isError ? 'danger' : 'primary'}
            title={isError ? 'Error msg' : t('SWAP_SCREEN.GET_QUOTES')}
            loading={isGetQuotesLoading}
            onClick={getQuotes}
          />
        </SendButtonContainer>
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}
