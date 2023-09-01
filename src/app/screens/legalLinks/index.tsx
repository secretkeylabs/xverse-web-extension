import LinkIcon from '@assets/img/linkIcon.svg';
import Separator from '@components/separator';
import { PRIVACY_POLICY_LINK, TERMS_LINK } from '@utils/constants';
import { saveIsTermsAccepted } from '@utils/localStorage';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  paddingTop: props.theme.spacing(8),
}));

const Title = styled.h1((props) => ({
  ...props.theme.bold_tile_text,
  color: props.theme.colors.white_0,
  marginTop: props.theme.spacing(20),
}));

const SubTitle = styled.h1((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(8),
}));

const ActionButton = styled.a((props) => ({
  ...props.theme.body_m,
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(8),
  color: props.theme.colors.white_0,
}));

const CustomisedActionButton = styled(ActionButton)`
  :hover {
    opacity: 0.8;
  }
  :active {
    opacity: 1;
  }
`;

const ActionButtonsContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(20),
}));

const AcceptButton = styled.button((props) => ({
  ...props.theme.body_bold_m,
  display: 'flex',
  color: props.theme.colors.elevation0,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 'auto',
  marginBottom: props.theme.spacing(32),
  backgroundColor: props.theme.colors.action.classic,
  borderRadius: props.theme.radius(1),
  height: 44,
  width: '100%',
}));

function LegalLinks() {
  const { t } = useTranslation('translation', { keyPrefix: 'LEGAL_SCREEN' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleLegalAccept = () => {
    saveIsTermsAccepted(true);
    const isRestore = !!searchParams.get('restore');
    if (isRestore) {
      navigate('/restoreWallet', { replace: true });
    } else {
      navigate('/backup', { replace: true });
    }
  };
  return (
    <Container>
      <Title>{t('SCREEN_TITLE')}</Title>
      <SubTitle>{t('SCREEN_SUBTITLE')}</SubTitle>
      <ActionButtonsContainer>
        <CustomisedActionButton href={TERMS_LINK} target="_blank">
          {t('TERMS_SERVICES_LINK_BUTTON')}
          <img src={LinkIcon} alt="terms" />
        </CustomisedActionButton>
        <Separator />
        <CustomisedActionButton href={PRIVACY_POLICY_LINK} target="_blank">
          {t('PRIVACY_POLICY_LINK_BUTTON')}
          <img src={LinkIcon} alt="privacy" />
        </CustomisedActionButton>
      </ActionButtonsContainer>
      <AcceptButton onClick={handleLegalAccept}>{t('ACCEPT_LEGAL_BUTTON')}</AcceptButton>
    </Container>
  );
}

export default LegalLinks;
