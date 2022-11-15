import styled, { useTheme } from 'styled-components';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { microstacksToStx } from '@secretkeylabs/xverse-core';
import { Pool } from '@secretkeylabs/xverse-core/types';
import BigNumber from 'bignumber.js';
import ArrowSquareOut from '@assets/img/send/arrow_square_out.svg';
import ActionButton from '@components/button';
import useStackingData from '@hooks/useStackingData';
import { XVERSE_WEB_POOL_URL } from '@utils/constants';
import StackingInfoTile from './stackInfoTile';

const Container = styled.div((props) => ({
  margin: props.theme.spacing(8),
  borderBottom: `1px solid ${props.theme.colors.background.elevation3}`,
  borderTop: `1px solid ${props.theme.colors.background.elevation3}`,
}));

const StackingInfoContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(30),
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

const ButtonContainer = styled.div((props) => ({
  margin: props.theme.spacing(8),

}));

const RowContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(12),
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  justifyContent: 'space-between',
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginTop: props.theme.spacing(16),
}));

const StackingDescriptionText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(12),
  color: props.theme.colors.white['200'],
}));

function StartStacking() {
  const { t } = useTranslation('translation', { keyPrefix: 'STACKING_SCREEN' });
  const [poolAvailable, setPoolAvailable] = useState(false);
  const { stackingData } = useStackingData();

  const theme = useTheme();
  const [pool, setPool] = useState<Pool | undefined>(undefined);

  useEffect(() => {
    if (stackingData) {
      if (stackingData?.poolInfo?.pools?.length! > 0) {
        const pools = stackingData?.poolInfo?.pools!;
        setPool(pools[0]);
        setPoolAvailable(true);
      }
    }
  }, [stackingData]);

  function getMinimum() {
    const min = poolAvailable ? pool!.minimum : 0;
    return microstacksToStx(new BigNumber(min)).toString();
  }

  function getCycles() {
    const minCycles = poolAvailable ? Math.min(...pool!.available_cycle_durations) : 0;
    const maxCycles = poolAvailable ? Math.max(...pool!.available_cycle_durations) : 0;
    return `${minCycles}-${maxCycles}`;
  }

  const handleOnClick = () => {
    window.open(XVERSE_WEB_POOL_URL);
  };

  return (
    <>
      <Container>
        <TitleText>{t('STACK_AND_EARN')}</TitleText>
        <StackingDescriptionText>{t('STACKING_INFO')}</StackingDescriptionText>
      </Container>
      <StackingInfoContainer>
        <RowContainer>
          <StackingInfoTile title={t('APY')} value={pool ? `${pool?.estimated_yield}%` : undefined} />
          <StackingInfoTile title={t('POOL_FEE')} value={pool ? `${pool?.fee_percent}%` : undefined} color={theme.colors.feedback.success} />
        </RowContainer>
        <RowContainer>
          <StackingInfoTile title={t('MINIMUM_AMOUNT')} value={`${getMinimum()} STX`} />
          <StackingInfoTile title={t('REWARD_CYCLES')} value={`${getCycles()}`} />
        </RowContainer>
      </StackingInfoContainer>
      <ButtonContainer>
        <ActionButton src={ArrowSquareOut} text={t('START_STACKNG')} onPress={handleOnClick} />
      </ButtonContainer>
    </>

  );
}

export default StartStacking;
