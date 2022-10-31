import styled from 'styled-components';
import XverseLogo from '@assets/img/settings/logo.svg';
import { useTranslation } from 'react-i18next';
import useWalletSelector from '@hooks/useWalletSelector';
import SettingComponent from './settingComponent';

const Container = styled.div`
display: flex;
flex-direction: column;
flex: 1;
overflow-y: auto;
&::-webkit-scrollbar {
  display: none;
}
`;

const LogoContainer = styled.div((props) => ({
  paddingTop: props.theme.spacing(16),
  paddingBottom: props.theme.spacing(16),
  paddingLeft: props.theme.spacing(11),
  paddingRight: props.theme.spacing(11),
  borderBottom: `1px solid ${props.theme.colors.background.elevation3}`,
}));

function Setting() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const {
    fiatCurrency,
  } = useWalletSelector();
  return (
    <>
      <LogoContainer>
        <img src={XverseLogo} alt="xverse logo" />
      </LogoContainer>
      <Container>
        <SettingComponent title={t('GENERAL')} text={t('CURRENCY')} textDetail={fiatCurrency} showDivider />
      </Container>
    </>

  );
}

export default Setting;
