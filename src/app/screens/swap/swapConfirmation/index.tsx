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
import SponsoredTransactionIcon from '@assets/img/transactions/CircleWavyCheck.svg';
import InfoContainer from '@components/infoContainer';
import { SUPPORT_URL_TAB_TARGET, SWAP_SPONSOR_DISABLED_SUPPORT_URL } from '@utils/constants';

const TitleText = styled.div((props) => ({
  fontSize: 21,
  fontWeight: 700,
  color: props.theme.colors.white['0'],
  marginBottom: props.theme.spacing(12),
  marginTop: props.theme.spacing(12),
}));

export const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: props.theme.spacing(8),
  marginTop: props.theme.spacing(8),
  position: 'sticky',
  bottom: 0,
  background: props.theme.colors.background.elevation0,
  padding: `${props.theme.spacing(12)}px 0`,
}));

export const ActionButtonWrap = styled.div((props) => ({
  marginRight: props.theme.spacing(8),
  width: '100%',
}));

const SponsoredTransactionText = styled.div((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[200],
  marginTop: props.theme.spacing(10),
  display: 'flex',
  gap: props.theme.spacing(4),
}));

const Icon = styled.img((props) => ({
  marginTop: props.theme.spacing(1),
  width: 24,
  height: 24,
}));

const StyledInfoContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(4),
}));

export default function SwapConfirmation() {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_CONFIRM_SCREEN' });
  const location = useLocation();
  const navigate = useNavigate();
  const swap = useConfirmSwap(location.state);

  const onCancel = useCallback(() => {
    navigate('/swap');
  }, [navigate]);

  const [confirming, setConfirming] = useState(false);
  const onConfirm = useCallback(() => {
    setConfirming(true);
    swap.onConfirm().finally(() => {
      setConfirming(false);
    });
  }, [swap]);

  const handleClickLearnMore = () => {
    window.open(SWAP_SPONSOR_DISABLED_SUPPORT_URL, SUPPORT_URL_TAB_TARGET, 'noreferrer noopener');
  };

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      <Container>
        <TitleText>{t('TOKEN_SWAP')}</TitleText>
        {swap.isSponsorDisabled && (
          <StyledInfoContainer>
            <InfoContainer
              bodyText={t('SWAP_TRANSACTION_CANNOT_BE_SPONSORED')}
              type="Info"
              redirectText={t('LEARN_MORE')}
              onClick={handleClickLearnMore}
            />
          </StyledInfoContainer>
        )}
        <StxInfoBlock type="transfer" swap={swap} />
        <StxInfoBlock type="receive" swap={swap} />
        <FunctionBlock name={swap.functionName} />
        <RouteBlock swap={swap} />
        {!swap.isSponsored && (
          <FeesBlock lpFee={swap.lpFeeAmount} lpFeeFiatAmount={swap.lpFeeFiatAmount} />
        )}
        {swap.isSponsored ? (
          <SponsoredTransactionText>
            <Icon src={SponsoredTransactionIcon} />
            {t('THIS_IS_A_SPONSORED_TRANSACTION')}
          </SponsoredTransactionText>
        ) : (
          <AdvanceSettings swap={swap} />
        )}
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
