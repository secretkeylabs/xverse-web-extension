import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useWalletSelector from '@hooks/useWalletSelector';
import useWalletSession from '@hooks/useWalletSession';
import { WalletSessionPeriods } from '@stores/wallet/actions/types';
import TopRow from '@components/topRow';
import ActionButton from '@components/button';
import TimerHalf from '@assets/img/settings/TimerHalf.svg';
import Timer from '@assets/img/settings/Timer.svg';
import TimerFull from '@assets/img/settings/TimerFull.svg';

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
  ...props.theme.body_medium_m,
  backgroundColor: 'transparent',
  border: `1px solid ${props.selected ? props.theme.colors.white[0] : props.theme.colors.grey}`,
  color: props.theme.colors.white[0],
  borderRadius: props.theme.radius(1),
  height: 44,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  marginBottom: props.theme.spacing(12),
  paddingLeft: props.theme.spacing(6),
  paddingRight: props.theme.spacing(6),
}));

const TimerIcon = styled.img((props) => ({
  width: 18,
  height: 21,
  marginRight: props.theme.spacing(12),
}));

function LockCountdown() {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const { walletLockPeriod } = useWalletSelector();
  const [selectedTime, setSelectedTime] = useState(walletLockPeriod);
  const { setWalletLockPeriod } = useWalletSession();

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const onChooseLow = () => {
    setSelectedTime(WalletSessionPeriods.LOW);
  };

  const onChooseStandard = () => {
    setSelectedTime(WalletSessionPeriods.STANDARD);
  };

  const onChooseLong = () => {
    setSelectedTime(WalletSessionPeriods.LONG);
  };

  const onSave = () => {
    setWalletLockPeriod(selectedTime);
    navigate(-1);
  };

  return (
    <>
      <TopRow title={t('LOCK_COUNTDOWN')} onClick={handleBackButtonClick} />
      <Container>
        <Title>{t('LOCK_COUNTDOWN_TITLE')}</Title>
        <TimeSelectionBox
          selected={selectedTime === WalletSessionPeriods.LOW}
          onClick={onChooseLow}
        >
          <TimerIcon src={Timer} alt="Low" />
          {`${WalletSessionPeriods.LOW} minute`}
        </TimeSelectionBox>
        <TimeSelectionBox
          selected={selectedTime === WalletSessionPeriods.STANDARD}
          onClick={onChooseStandard}
        >
          <TimerIcon src={TimerHalf} alt="Standard" />
          {`${WalletSessionPeriods.STANDARD} minutes`}
        </TimeSelectionBox>
        <TimeSelectionBox
          selected={selectedTime === WalletSessionPeriods.LONG}
          onClick={onChooseLong}
        >
          <TimerIcon src={TimerFull} alt="Long" />
          {`${WalletSessionPeriods.LONG} minutes`}
        </TimeSelectionBox>
        <SaveButtonContainer>
          <ActionButton onPress={onSave} text={t('SAVE')} />
        </SaveButtonContainer>
      </Container>
    </>
  );
}

export default LockCountdown;
