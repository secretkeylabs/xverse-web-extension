import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useWalletSelector from '@hooks/useWalletSelector';
import XverseLogo from '@assets/img/settings/logo.svg';
import ArrowIcon from '@assets/img/settings/arrow.svg';
import ArrowSquareOut from '@assets/img/arrow_square_out.svg';
import BottomBar from '@components/tabBar';
import { PRIVACY_POLICY_LINK, TERMS_LINK, SUPPORT_LINK } from '@utils/constants';
import { useNavigate } from 'react-router-dom';
import SettingComponent from './settingComponent';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const LogoContainer = styled.div((props) => ({
  padding: props.theme.spacing(11),
  borderBottom: `1px solid ${props.theme.colors.background.elevation3}`,
}));

function Setting() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const { fiatCurrency, network } = useWalletSelector();
  const navigate = useNavigate();

  const openTermsOfService = () => {
    window.open(TERMS_LINK);
  };

  const openPrivacyPolicy = () => {
    window.open(PRIVACY_POLICY_LINK);
  };

  const openSupport = () => {
    window.open(SUPPORT_LINK);
  };

  const openFiatCurrencyScreen = () => {
    navigate('/fiat-currency');
  };

  return (
    <>
      <LogoContainer>
        <img src={XverseLogo} alt="xverse logo" />
      </LogoContainer>
      <Container>
        <SettingComponent
          title={t('GENERAL')}
          text={t('CURRENCY')}
          onClick={openFiatCurrencyScreen}
          textDetail={fiatCurrency}
          showDivider
        />
        <SettingComponent text={t('NETWORK')} textDetail={network} />
        <SettingComponent
          title={t('SECURITY')}
          text={t('UPDATE_PASSWORD')}
          icon={ArrowIcon}
          showDivider
        />
        <SettingComponent text={t('BACKUP_WALLET')} icon={ArrowIcon} showDivider />
        <SettingComponent text={t('REST_WALLET')} showWarningTitle />
        <SettingComponent
          title={t('ABOUT')}
          text={t('TERMS_OF_SERVICE')}
          onClick={openTermsOfService}
          icon={ArrowSquareOut}
          showDivider
        />
        <SettingComponent
          text={t('PRIVACY_POLICY')}
          onClick={openPrivacyPolicy}
          icon={ArrowSquareOut}
          showDivider
        />
        <SettingComponent
          text={t('SUPPORT_CENTER')}
          onClick={openSupport}
          icon={ArrowSquareOut}
          showDivider
        />
        <SettingComponent text={t('VERSION')} textDetail="1.0.1" />
      </Container>
      <BottomBar tab="settings" />
    </>
  );
}

export default Setting;
