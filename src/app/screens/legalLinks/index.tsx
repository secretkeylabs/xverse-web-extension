import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import LinkIcon from '@assets/img/linkIcon.svg';
import { PRIVACY_POLICY_LINK, TERMS_LINK } from 'app/core/constants/constants';
import { useNavigate } from 'react-router-dom';
import { saveIsTermsAccepted } from '@utils/localStorage';

const Container = styled.div((props) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: props.theme.spacing(8),
}));

const Title = styled.h1((props) => ({
  ...props.theme.tile_text,
  color: props.theme.colors.white['0'],
  marginTop: props.theme.spacing(20),
}));

const SubTitle = styled.h1((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white['200'],
  marginTop: props.theme.spacing(8),
}));

const ActionButton = styled.a((props) => ({
  ...props.theme.body_m,
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(8),
  color: props.theme.colors.white['0'],
}));

const ActionButtonsContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(20),
}));

const AcceptButtonContainer = styled.div((props) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  marginBottom: props.theme.spacing(20),
}));

const AcceptButton = styled.button((props) => ({
  ...props.theme.body_bold_m,
  display: 'flex',
  color: props.theme.colors.white['0'],
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: props.theme.spacing(8),
  backgroundColor: props.theme.colors.action.classic,
  borderRadius: props.theme.radius(1),
  height: 44,
  width: '100%',
}));

function LegalLinks() {
  const { t } = useTranslation('translation', { keyPrefix: 'LEGAL_SCREEN' });
  const navigate = useNavigate();

  const handleLegalAccept = () => {
    saveIsTermsAccepted(true);
    navigate('/backup');
  };
  return (
    <Container>
      <Title>{t('SCREEN_TITLE')}</Title>
      <SubTitle>{t('SCREEN_SUBTITLE')}</SubTitle>
      <ActionButtonsContainer>
        <ActionButton href={TERMS_LINK} target="_blank">
          {t('TERMS_SERVICES_LINK_BUTTON')}
          <img src={LinkIcon} alt="terms" />
        </ActionButton>
        <ActionButton href={PRIVACY_POLICY_LINK} target="_blank">
          {t('PRIVACY_POLICY_LINK_BUTTON')}
          <img src={LinkIcon} alt="privacy" />
        </ActionButton>
      </ActionButtonsContainer>
      <AcceptButtonContainer>
        <AcceptButton onClick={handleLegalAccept}>{t('ACCEPT_LEGAL_BUTTON')}</AcceptButton>
      </AcceptButtonContainer>
    </Container>
  );
}

export default LegalLinks;
