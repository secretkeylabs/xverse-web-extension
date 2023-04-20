import BottomBar from '@components/tabBar';
import AccountHeaderComponent from '@components/accountHeader';
import { Container } from '@screens/home';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import FunctionBlock from '@screens/swap/swapConfirmation/functionBlock';
import ActionButton from '@components/button';
import FreesBlock from '@screens/swap/swapConfirmation/freesBlock';
import RouteBlock from '@screens/swap/swapConfirmation/routeBlock';
import StxInfoBlock from '@screens/swap/swapConfirmation/stxInfoBlock';
import { useCallback } from 'react';

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

  const onCancel = useCallback(() => {
    window.close();
  }, []);

  const onConfirm = useCallback(() => {}, []);

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      <Container>
        <TitleText>{t('TOKEN_SWAP')}</TitleText>
        <StxInfoBlock type="transfer" />
        <StxInfoBlock type="receive" />
        <FunctionBlock name={'token-swap'} />
        <RouteBlock />
        <FreesBlock fee={12} currency={'STX'} />
        <ButtonContainer>
          <ActionButtonWrap>
            <ActionButton text={t('CANCEL')} transparent onPress={onCancel} />
          </ActionButtonWrap>
          <ActionButton text={t('CONFIRM')} onPress={onConfirm} />
        </ButtonContainer>
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}
