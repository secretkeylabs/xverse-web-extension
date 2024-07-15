import SponsoredTransactionIcon from '@assets/img/transactions/CircleWavyCheck.svg';
import InfoContainer from '@components/infoContainer';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { Container } from '@screens/home/index.styled';
import AdvanceSettings from '@screens/swap/swapStacksConfirmation/advanceSettings';
import FeesBlock from '@screens/swap/swapStacksConfirmation/feesBlock';
import FunctionBlock from '@screens/swap/swapStacksConfirmation/functionBlock';
import RouteBlock from '@screens/swap/swapStacksConfirmation/routeBlock';
import StxInfoBlock from '@screens/swap/swapStacksConfirmation/stxInfoBlock';
import { useConfirmSwap } from '@screens/swap/swapStacksConfirmation/useConfirmSwap';
import Button from '@ui-library/button';
import { SUPPORT_URL_TAB_TARGET, SWAP_SPONSOR_DISABLED_SUPPORT_URL } from '@utils/constants';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const TitleText = styled.div((props) => ({
  fontSize: 21,
  fontWeight: 700,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(12),
  marginTop: props.theme.spacing(12),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: props.theme.space.s,
  marginTop: props.theme.space.m,
  position: 'sticky',
  bottom: 0,
  background: props.theme.colors.elevation0,
  padding: `${props.theme.space.s} 0`,
}));

const SponsoredTransactionText = styled.div((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
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

export default function SwapStacksConfirmation() {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_CONFIRM_SCREEN' });
  const location = useLocation();
  const navigate = useNavigate();
  const swap = useConfirmSwap(location.state);

  const handleGoBack = () => {
    navigate(-1);
  };

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
      <TopRow onClick={() => navigate(-1)} />
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
          <FeesBlock txFee={swap.txFeeAmount} txFeeFiatAmount={swap.txFeeFiatAmount} />
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
          <Button title={t('CANCEL')} variant="secondary" onClick={handleGoBack} />
          <Button title={t('CONFIRM')} loading={confirming} onClick={onConfirm} />
        </ButtonContainer>
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}
