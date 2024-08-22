import TopRow from '@components/topRow';
import { PRIVACY_POLICY_LINK, STORE_LISTING, TERMS_LINK } from '@utils/constants';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Container, Title } from '../index.styles';
import SettingComponent from '../settingComponent';

declare const VERSION: string;

function About() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const navigate = useNavigate();

  const openTermsOfService = () => {
    window.open(TERMS_LINK);
  };

  const openPrivacyPolicy = () => {
    window.open(PRIVACY_POLICY_LINK);
  };

  const openStoreListing = () => {
    window.open(STORE_LISTING);
  };

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <Title>{t('ABOUT')}</Title>
        <SettingComponent
          text={t('TERMS_OF_SERVICE')}
          link
          onClick={openTermsOfService}
          showDivider
        />
        <SettingComponent text={t('PRIVACY_POLICY')} link onClick={openPrivacyPolicy} showDivider />
        <SettingComponent
          text={`${t('VERSION')}`}
          textDetail={`${VERSION} (Beta)`}
          link
          onClick={openStoreListing}
        />
      </Container>
    </>
  );
}

export default About;
