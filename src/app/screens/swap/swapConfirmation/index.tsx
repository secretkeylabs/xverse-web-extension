import BottomBar from '@components/tabBar';
import AccountHeaderComponent from '@components/accountHeader';
import { Container } from '@screens/home';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import FunctionBlock from '@screens/swap/swapConfirmation/functionBlock';
import ActionButton from '@components/button';
import FeesBlock from '@screens/swap/swapConfirmation/freesBlock';
import RouteBlock from '@screens/swap/swapConfirmation/routeBlock';
import StxInfoBlock from '@screens/swap/swapConfirmation/stxInfoBlock';
import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConfirmSwap } from '@screens/swap/swapConfirmation/useConfirmSwap';
import { AdvanceSettings } from '@screens/swap/swapConfirmation/advanceSettings';

const TitleText = styled.div((props) => ({
  fontSize: 21,
  fontWeight: 700,
  color: props.theme.colors.white['0'],
  marginBottom: props.theme.spacing(16),
  marginTop: props.theme.spacing(12),
}));

export const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: props.theme.spacing(20),
  marginTop: props.theme.spacing(16),
}));

export const ActionButtonWrap = styled.div((props) => ({
  marginRight: props.theme.spacing(8),
  width: '100%',
}));

export default function SwapConfirmation() {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_CONFIRM_SCREEN' });
  const location = useLocation();
  const navigate = useNavigate();
  const swap = useConfirmSwap(location.state);

  const onCancel = useCallback(() => {
    navigate('/swap');
  }, []);

  const [confirming, setConfirming] = useState(false);
  const onConfirm = useCallback(() => {
    setConfirming(true);
    swap.onConfirm().finally(() => {
      setConfirming(false);
    });
  }, []);

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      <Container>
        <TitleText>{t('TOKEN_SWAP')}</TitleText>
        <StxInfoBlock type="transfer" swap={swap} />
        <StxInfoBlock type="receive" swap={swap} />
        <FunctionBlock name={'swap-helper'} />
        <RouteBlock swap={swap} />
        <FeesBlock
          lpFee={swap.lpFeeAmount}
          lpFeeFiatAmount={swap.lpFeeFiatAmount}
          currency={swap.fromToken.name}
        />
        <AdvanceSettings swap={swap} />
        <ButtonContainer>
          <ActionButtonWrap>
            <ActionButton text={t('CANCEL')} transparent onPress={onCancel} />
          </ActionButtonWrap>
          <ActionButton text={t('CONFIRM')} processing={confirming} onPress={onConfirm} />
        </ButtonContainer>
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}
