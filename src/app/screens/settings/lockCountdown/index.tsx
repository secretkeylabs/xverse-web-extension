import Timer15 from '@assets/img/settings/Timer15m.svg';
import Timer1 from '@assets/img/settings/Timer1h.svg';
import Timer30 from '@assets/img/settings/Timer30m.svg';
import Timer3 from '@assets/img/settings/Timer3h.svg';
import ActionButton from '@components/button';
import TopRow from '@components/topRow';
import useWalletSelector from '@hooks/useWalletSelector';
import useWalletSession from '@hooks/useWalletSession';
import { WalletSessionPeriods } from '@stores/wallet/actions/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflowY: 'auto',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  paddingBottom: props.theme.spacing(8),
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

const Title = styled.p((props) => ({
  ...props.theme.body_m,
  marginTop: props.theme.spacing(21),
  marginBottom: props.theme.spacing(21),
}));

const SaveButtonContainer = styled.div((props) => ({
  marginTop: 'auto',
  marginBottom: props.theme.spacing(10),
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
  marginRight: props.theme.space.l,
  opacity: props.selected ? 1 : 0.8,
}));

const getLabel = (period: number) => {
  if (period < 60) {
    return `${period} minutes`;
  }
  const hours = period / 60;
  return `${hours} hour${hours === 1 ? '' : 's'}`;
};

function LockCountdown() {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const { walletLockPeriod } = useWalletSelector();
  const [selectedTime, setSelectedTime] = useState(walletLockPeriod);
  const { setWalletLockPeriod } = useWalletSession();

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const onSave = () => {
    setWalletLockPeriod(selectedTime);
    navigate(-1);
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
      <TopRow title={t('LOCK_COUNTDOWN')} onClick={handleBackButtonClick} />
      <Container>
        <Title>{t('LOCK_COUNTDOWN_TITLE')}</Title>
        {periodOptions.map((period) => (
          <TimeSelectionBox
            key={period}
            selected={selectedTime === period}
            onClick={() => setSelectedTime(period)}
          >
            <TimerIcon
              selected={selectedTime === period}
              src={iconsByPeriod[period]}
              alt={period.toString()}
            />
            {getLabel(period)}
          </TimeSelectionBox>
        ))}
        <SaveButtonContainer>
          <ActionButton onPress={onSave} text={t('SAVE')} />
        </SaveButtonContainer>
      </Container>
    </>
  );
}

export default LockCountdown;
