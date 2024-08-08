import { PRIVACY_POLICY_LINK, TERMS_LINK } from '@utils/constants';
import { useTranslation } from 'react-i18next';
import SettingComponent from '../settingComponent';

declare const VERSION: string;

function About() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });

  const openTermsOfService = () => {
    window.open(TERMS_LINK);
  };

  const openPrivacyPolicy = () => {
    window.open(PRIVACY_POLICY_LINK);
  };

  return (
    <>
      <SettingComponent
        title={t('ABOUT')}
        text={t('TERMS_OF_SERVICE')}
        onClick={openTermsOfService}
        showDivider
      />
      <SettingComponent text={t('PRIVACY_POLICY')} onClick={openPrivacyPolicy} showDivider />
      <SettingComponent text={`${t('VERSION')}`} textDetail={`${VERSION} (Beta)`} />
    </>
  );
}

export default About;
