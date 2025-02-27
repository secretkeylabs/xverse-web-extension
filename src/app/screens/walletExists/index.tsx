import WarningIcon from '@assets/img/Warning_red.svg';
import Checkbox from '@ui-library/checkbox';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ContentContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: props.theme.spacing(8),
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}));

const Title = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white_0,
  marginTop: props.theme.spacing(8),
  textAlign: 'center',
  fontSize: 20,
}));

const Subtitle = styled.h2((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_400,
  marginTop: props.theme.spacing(8),
  textAlign: 'center',
}));

const ContinueButton = styled.button((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.elevation0,
  backgroundColor: props.theme.colors.action.classic,
  borderRadius: props.theme.radius(1),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(30),
  height: 44,
  textAlign: 'center',
  ':hover': {
    background: props.theme.colors.action.classicLight,
  },
  ':focus': {
    background: props.theme.colors.action.classicLight,
    opacity: 0.6,
  },
  ':disabled': {
    background: props.theme.colors.action.classicLight,
    color: props.theme.colors.elevation8,
    cursor: 'initial',
  },
}));

const Icon = styled.img((props) => ({
  width: 88,
  height: 88,
  stroke: props.theme.colors.caution,
}));

const CheckBoxContainer = styled.div((props) => ({
  margin: props.theme.spacing(8),
  display: 'flex',
  justifyContent: 'center',
  userSelect: 'none',
}));

function WalletExists(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'WALLET_EXISTS_SCREEN' });
  const [userAccepted, setUserAccepted] = useState(false);

  const handleClose = async () => {
    window.close();
  };

  const handleToggleAccept = () => {
    setUserAccepted((currentUserAccepted) => !currentUserAccepted);
  };

  return (
    <>
      <ContentContainer>
        <Icon src={WarningIcon} alt="success" />
        <Title>{t('SCREEN_TITLE')}</Title>
        <Subtitle>{t('SCREEN_SUBTITLE')}</Subtitle>
      </ContentContainer>
      <CheckBoxContainer>
        <Checkbox
          checkboxId="backup"
          text={t('UNDERSTAND')}
          checked={userAccepted}
          onChange={handleToggleAccept}
        />
      </CheckBoxContainer>
      <ContinueButton onClick={handleClose} disabled={!userAccepted}>
        {t('CLOSE_TAB')}
      </ContinueButton>
    </>
  );
}

export default WalletExists;
