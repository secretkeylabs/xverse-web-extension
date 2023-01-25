import styled from 'styled-components';
import logo from '@assets/img/full_logo_vertical.svg';
import { useTranslation } from 'react-i18next';
import useWalletReducer from '@hooks/useWalletReducer';
import { animated, useSpring } from '@react-spring/web';

const ContentContainer = styled(animated.div)({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: 130,
});

const TopSectionContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const LandingTitle = styled.h1((props) => ({
  ...props.theme.tile_text,
  paddingTop: props.theme.spacing(15),
  paddingLeft: props.theme.spacing(34),
  paddingRight: props.theme.spacing(34),
  color: props.theme.colors.white['200'],
  textAlign: 'center',
}));

const ActionButtonsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: 'auto',
  paddingLeft: props.theme.spacing(10),
  paddingRight: props.theme.spacing(10),
  marginBottom: props.theme.spacing(32),
}));

const CreateButton = styled.button((props) => ({
  display: 'flex',
  ...props.theme.tile_text,
  fontSize: 12,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.action.classic,
  marginBottom: props.theme.spacing(8),
  width: '100%',
  height: 44,
  ':hover': {
    background: props.theme.colors.action.classicLight,
  },
  ':focus': {
    background: props.theme.colors.action.classicLight,
    opacity: 0.6,
  },
}));

const AppVersion = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['0'],
  textAlign: 'right',
  marginRight: props.theme.spacing(9),
  marginTop: props.theme.spacing(8),
}));

const RestoreButton = styled.button((props) => ({
  display: 'flex',
  ...props.theme.tile_text,
  fontSize: 12,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.background.elevation0,
  border: `0.5px solid ${props.theme.colors.background.elevation2}`,
  width: '100%',
  height: 44,
  ':hover': {
    background: props.theme.colors.background.elevation6_800,
  },
  ':focus': {
    background: props.theme.colors.action.classic800,
  },
}));

function Landing(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'LANDING_SCREEN' });
  const { createWallet } = useWalletReducer();
  const styles = useSpring({
    from: {
      opacity: 0,
      y: 24,
    },
    to: {
      y: 0,
      opacity: 1,
    },
    delay: 100,
  });

  const openInNewTab = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL('options.html#/onboarding'),
    });
  };

  const handlePressCreate = async () => {
    try {
      await createWallet();
    } catch (err) {
      return await Promise.reject(err);
    } finally {
      setTimeout(async () => openInNewTab(), 500);
    }
  };

  const handlePressRestore = async () => {
    try {
      window.localStorage.setItem('isRestore', 'true');
      await openInNewTab();
      return true;
    } catch (err) {
      return Promise.reject(err);
    }
  };
  return (
    <>
      <AppVersion>Beta</AppVersion>
      <ContentContainer style={styles}>
        <TopSectionContainer>
          <img src={logo} width={100} alt="logo" />
          <LandingTitle>{t('SCREEN_TITLE')}</LandingTitle>
        </TopSectionContainer>
        <ActionButtonsContainer>
          <CreateButton onClick={handlePressCreate}>{t('CREATE_WALLET_BUTTON')}</CreateButton>
          <RestoreButton onClick={handlePressRestore}>{t('RESTORE_WALLET_BUTTON')}</RestoreButton>
        </ActionButtonsContainer>
      </ContentContainer>
    </>
  );
}
export default Landing;
