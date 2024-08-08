import Timer15 from '@assets/img/settings/Timer15m.svg';
import Timer1 from '@assets/img/settings/Timer1h.svg';
import Timer30 from '@assets/img/settings/Timer30m.svg';
import Timer3 from '@assets/img/settings/Timer3h.svg';
import TopRow from '@components/topRow';
import useWalletSelector from '@hooks/useWalletSelector';
import useWalletSession from '@hooks/useWalletSession';
import { WalletSessionPeriods } from '@stores/wallet/actions/types';
import { getLockCountdownLabel } from '@utils/helper';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflowY: 'auto',
  padding: props.theme.space.m,
  paddingTop: 0,
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

const Title = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.space.l,
  marginBottom: props.theme.space.l,
}));

interface TimeSelectionBoxProps {
  selected: boolean;
}

const TimeSelectionBox = styled.button<TimeSelectionBoxProps>((props) => ({
  ...props.theme.typography.body_medium_m,
  backgroundColor: props.selected ? props.theme.colors.white_900 : 'transparent',
  border: `1px solid ${props.theme.colors.white_800}`,
  color: props.selected ? props.theme.colors.white_0 : props.theme.colors.white_200,
  borderRadius: props.theme.radius(1),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: props.theme.space.m,
  marginBottom: props.theme.space.s,
}));

const TimerIcon = styled.img<TimeSelectionBoxProps>((props) => ({
  width: 18,
  height: 21,
  marginRight: props.theme.space.m,
  opacity: props.selected ? 1 : 0.8,
}));

function LockCountdown() {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const { walletLockPeriod } = useWalletSelector();
  const { setWalletLockPeriod } = useWalletSession();

  const handleGoBack = () => {
    navigate(-1);
  };

  const onTimeSelect = (period: number) => {
    setWalletLockPeriod(period);
    toast(`${t('LOCK_COUNTDOWN_SET_TO')} ${getLockCountdownLabel(period, t)}`);
    handleGoBack();
  };

  const periodOptions: number[] = Object.keys(WalletSessionPeriods)
    .filter((key) => !Number.isNaN(Number(WalletSessionPeriods[key])))
    .map((key) => WalletSessionPeriods[key]);

  const iconsByPeriod = {
    [WalletSessionPeriods.LOW]: Timer15,
    [WalletSessionPeriods.STANDARD]: Timer30,
    [WalletSessionPeriods.LONG]: Timer1,
    [WalletSessionPeriods.VERY_LONG]: Timer3,
  };

  return (
    <>
      <TopRow title={t('LOCK_COUNTDOWN')} onClick={handleGoBack} />
      <Container>
        <Title>{t('LOCK_COUNTDOWN_TITLE')}</Title>
        {periodOptions.map((period) => (
          <TimeSelectionBox
            key={period}
            selected={walletLockPeriod === period}
            onClick={() => onTimeSelect(period)}
          >
            <TimerIcon
              selected={walletLockPeriod === period}
              src={iconsByPeriod[period]}
              alt={period.toString()}
            />
            {getLockCountdownLabel(period, t)}
          </TimeSelectionBox>
        ))}
      </Container>
    </>
  );
}

export default LockCountdown;
