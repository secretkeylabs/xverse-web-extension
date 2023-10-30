import ArrowSquareOut from '@assets/img/arrow_square_out.svg';
import ActionButton from '@components/button';
import useStackingData from '@hooks/queries/useStackingData';
import type { Pool } from '@secretkeylabs/xverse-core';
import { microstacksToStx } from '@secretkeylabs/xverse-core';
import { XVERSE_WEB_POOL_URL } from '@utils/constants';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import StackingInfoTile from './stackInfoTile';

const OuterContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const Container = styled.div((props) => ({
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(12),
  borderBottom: `1px solid ${props.theme.colors.elevation3}`,
}));

const StackingInfoContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(8),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'space-between',
}));

const ButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(16),
}));

const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginTop: props.theme.spacing(16),
}));

const StackingDescriptionText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(12),
  color: props.theme.colors.white_200,
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

  const getMinimum = () => {
    const min = poolAvailable ? pool!.minimum : 0;
    return microstacksToStx(new BigNumber(min)).toString();
  };

  const handleOnClick = () => {
    window.open(XVERSE_WEB_POOL_URL);
  };

  return (
    <>
      <OuterContainer>
        <Container>
          <TitleText>{t('STACK_AND_EARN')}</TitleText>
          <StackingDescriptionText>{t('STACKING_INFO')}</StackingDescriptionText>
        </Container>
        <StackingInfoContainer>
          <ColumnContainer>
            <StackingInfoTile
              title={t('APY')}
              value={pool ? `${pool?.estimated_yield}%` : undefined}
            />
            <StackingInfoTile title={t('MINIMUM_AMOUNT')} value={`${getMinimum()} STX`} />
          </ColumnContainer>
          <ColumnContainer>
            <StackingInfoTile
              title={t('POOL_FEE')}
              value={pool ? `${pool?.fee_percent}%` : undefined}
              color={theme.colors.feedback.success}
            />
            <StackingInfoTile title={t('REWARD_CYCLES')} value="Flexible" />
          </ColumnContainer>
        </StackingInfoContainer>
      </OuterContainer>

      <ButtonContainer>
        <ActionButton src={ArrowSquareOut} text={t('START_STACKING')} onPress={handleOnClick} />
      </ButtonContainer>
    </>
  );
}

export default StartStacking;
