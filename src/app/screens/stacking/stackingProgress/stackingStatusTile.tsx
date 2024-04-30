import TokenTicker from '@assets/img/dashboard/stx_icon.svg';
import useStackingData from '@hooks/queries/useStackingData';
import { StackingState } from '@secretkeylabs/xverse-core';
import { XVERSE_WEB_POOL_URL } from '@utils/constants';
import { useTranslation } from 'react-i18next';
import {
  BoldText,
  ColumnContainer,
  Container,
  Dot,
  Icon,
  StatusContainer,
  StatusText,
  SubText,
  TextContainer,
} from './components';

function StackingStatusTile() {
  const { t } = useTranslation('translation', { keyPrefix: 'STACKING_SCREEN' });
  const { stackingData } = useStackingData();

  // Refactored from existing logic. Not sure why `status` is being calculated
  // this way. Worth moving to xverse-core?
  const status: StackingState = (() => {
    if (!stackingData?.stackerInfo?.stacked && stackingData?.delegationInfo?.delegated) {
      return 'Delegated';
    }

    if (stackingData?.stackerInfo?.stacked) {
      return 'Stacking';
    }

    return 'Pending';
  })();

  const handleOnClick = () => {
    window.open(XVERSE_WEB_POOL_URL);
  };

  return (
    <Container onClick={handleOnClick}>
      <TextContainer>
        <Icon src={TokenTicker} alt="Ticker" />
        <ColumnContainer>
          <BoldText>{t('STACK_STX')}</BoldText>
          <SubText>{t('EARN_BTC')}</SubText>
        </ColumnContainer>
      </TextContainer>

      <StatusContainer>
        <Dot />
        <StatusText>{status === 'Stacking' ? t('IN_PROGRESS') : t('DELEGATED')}</StatusText>
      </StatusContainer>
    </Container>
  );
}

export default StackingStatusTile;
