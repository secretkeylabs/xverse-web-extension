import styled from 'styled-components';
import TokenTicker from '@assets/img/stacking/token_ticker.svg';
import { useTranslation } from 'react-i18next';
import useStackingData from '@hooks/useStackingData';
import { StackingState } from '@secretkeylabs/xverse-core/stacking';
import { useEffect, useState } from 'react';
import { XVERSE_WEB_POOL_URL } from '@utils/constants';

const Container = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: props.theme.colors.background.elevation1,
  borderRadius: props.theme.radius(2),
  padding: props.theme.spacing(9),
}));

const TextContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
});

const StatusContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'rgba(81, 214, 166, 0.15)',
  borderRadius: props.theme.radius(7),
  paddingLeft: props.theme.spacing(6),
  paddingRight: props.theme.spacing(6),
  paddingTop: props.theme.spacing(2),
  paddingBottom: props.theme.spacing(2),
}));

const Dot = styled.div((props) => ({
  width: 7,
  height: 7,
  borderRadius: props.theme.radius(9),
  marginRight: props.theme.spacing(4),
  background: props.theme.colors.feedback.success,
}));

const ColumnContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginLeft: props.theme.spacing(6),
}));

const BoldText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['0'],
}));

const SubText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['400'],
}));

const StatusText = styled.h1((props) => ({
  ...props.theme.body_xs,
  fontWeight: 500,
  color: props.theme.colors.white['0'],
}));

function StackingStatusTile() {
  const { t } = useTranslation('translation', { keyPrefix: 'STACKING_SCREEN' });
  const { stackingData } = useStackingData();
  const [status, setStatus] = useState<StackingState>('Pending');

  useEffect(() => {
    if (stackingData) {
      if (!stackingData?.stackerInfo?.stacked && stackingData?.delegationInfo?.delegated) {
        setStatus('Delegated');
      } else if (stackingData?.stackerInfo?.stacked) { setStatus('Stacking'); }
    }
  }, [stackingData]);

  const handleOnClick = () => {
    window.open(XVERSE_WEB_POOL_URL);
  };

  return (
    <Container onClick={handleOnClick}>
      <TextContainer>
        <img src={TokenTicker} alt="Ticker" />
        <ColumnContainer>
          <BoldText>{t('STACK_STX')}</BoldText>
          <SubText>{t('EARN_BTC')}</SubText>
        </ColumnContainer>
      </TextContainer>

      <StatusContainer>
        <Dot />
        <StatusText>
          {status === 'Stacking' ? t('IN_PROGRESS') : t('DELEGATED')}
        </StatusText>
      </StatusContainer>
    </Container>
  );
}

export default StackingStatusTile;
