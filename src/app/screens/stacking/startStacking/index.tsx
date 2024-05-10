import ArrowSquareOut from '@assets/img/arrow_square_out.svg';
import ActionButton from '@components/button';
import useStackingData from '@hooks/queries/useStackingData';
import type { Pool } from '@secretkeylabs/xverse-core';
import { microstacksToStx } from '@secretkeylabs/xverse-core';
import { XVERSE_WEB_POOL_URL } from '@utils/constants';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import {
  ButtonContainer,
  ColumnContainer,
  Container,
  OuterContainer,
  StackingDescriptionText,
  StackingInfoContainer,
  TitleText,
} from './components';
import StackingInfoTile from './stackInfoTile';

function StartStacking() {
  const { t } = useTranslation('translation', { keyPrefix: 'STACKING_SCREEN' });
  const { stackingData } = useStackingData();

  const theme = useTheme();

  const pool: Pool | undefined = stackingData?.poolInfo?.pools[0];
  const isPoolAvailable = !!pool;

  const getMinimum = () => {
    const min = isPoolAvailable ? pool.minimum : 0;
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
