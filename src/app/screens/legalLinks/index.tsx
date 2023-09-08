import LinkIcon from '@assets/img/linkIcon.svg';
import ActionButton from '@components/button';
import Separator from '@components/separator';
import { CustomSwitch } from '@screens/ledger/importLedgerAccount/index.styled';
import { PRIVACY_POLICY_LINK, TERMS_LINK } from '@utils/constants';
import { saveIsTermsAccepted } from '@utils/localStorage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

const Container = styled.div((props) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: props.theme.spacing(8),
  paddingTop: props.theme.spacing(28),
  paddingBottom: props.theme.spacing(28),
  justifyContent: 'space-between',
}));

const Title = styled.h1((props) => ({
  ...props.theme.bold_tile_text,
  color: props.theme.colors.white['0'],
}));

const SubTitle = styled.h1((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white['200'],
  marginTop: props.theme.spacing(8),
}));

const LinksContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(20),
}));

const Link = styled.a((props) => ({
  ...props.theme.body_m,
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(8),
  color: props.theme.colors.white['0'],
}));

const CustomizedLink = styled(Link)`
  transition: opacity 0.1s ease;
  :hover {
    opacity: 0.8;
  }
  :active {
    opacity: 1;
  }
`;

const SwitchContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: props.theme.spacing(8),
  fontSize: '0.875rem',
}));

function LegalLinks() {
  const { t } = useTranslation('translation', { keyPrefix: 'LEGAL_SCREEN' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const [isEnabled, setIsEnabled] = useState(false);

  // TODO: Add data collection logic
  const handleSwitchToggle = () => setIsEnabled((previousEnabledState) => !previousEnabledState);

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
      <div>
        <Title>{t('SCREEN_TITLE')}</Title>
        <SubTitle>{t('SCREEN_SUBTITLE')}</SubTitle>
        <LinksContainer>
          <CustomizedLink href={TERMS_LINK} target="_blank">
            {t('TERMS_SERVICES_LINK_BUTTON')}
            <img src={LinkIcon} alt="terms" />
          </CustomizedLink>
          <Separator />
          <CustomizedLink href={PRIVACY_POLICY_LINK} target="_blank">
            {t('PRIVACY_POLICY_LINK_BUTTON')}
            <img src={LinkIcon} alt="privacy" />
          </CustomizedLink>
          <SwitchContainer>
            <div>Authorize data collection</div>
            <CustomSwitch
              onColor={theme.colors.purple_main}
              offColor={theme.colors.background.elevation3}
              onChange={handleSwitchToggle}
              checked={isEnabled}
              uncheckedIcon={false}
              checkedIcon={false}
            />
          </SwitchContainer>
        </LinksContainer>
      </div>
      <ActionButton text={t('ACCEPT_LEGAL_BUTTON')} onPress={handleLegalAccept} />
    </Container>
  );
}

export default LegalLinks;
