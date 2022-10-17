import styled from 'styled-components';
import logo from '@assets/img/full_logo_vertical.svg';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setWalletAction } from '@stores/wallet/actions/actionCreators';
import { newWallet } from '@secretkeylabs/xverse-core/wallet';

const TopSectionContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'center',
  flex: 0.5,
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
  flex: 0.5,
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingLeft: props.theme.spacing(10),
  paddingRight: props.theme.spacing(10),
  marginBottom: props.theme.spacing(30),
}));

const CreateButton = styled.button((props) => ({
  display: 'flex',
  ...props.theme.body_xs,
  color: props.theme.colors.white['200'],
  textAlign: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.action.classic,
  marginBottom: props.theme.spacing(8),
  width: '100%',
  height: 44,
}));

const RestoreButton = styled.button((props) => ({
  display: 'flex',
  ...props.theme.body_xs,
  color: props.theme.colors.white['200'],
  textAlign: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.background.elevation0,
  border: `0.5px solid ${props.theme.colors.background.elevation2}`,
  width: '100%',
  height: 44,
}));

function Landing(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'LANDING_SCREEN' });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const openInNewTab = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL('options.html#/onboarding'),
    });
  };

  const handlePressCreate = async () => {
    try {
      const wallet = await newWallet();
      dispatch(setWalletAction(wallet));
    } catch (err) {
      return await Promise.reject(err);
    } finally {
      await openInNewTab();
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
      <TopSectionContainer>
        <img src={logo} width={100} alt="logo" />
        <LandingTitle>{t('SCREEN_TITLE')}</LandingTitle>
      </TopSectionContainer>
      <ActionButtonsContainer>
        <CreateButton onClick={handlePressCreate}>{t('CREATE_WALLET_BUTTON')}</CreateButton>
        <RestoreButton onClick={handlePressRestore}>{t('RESTORE_WALLET_BUTTON')}</RestoreButton>
      </ActionButtonsContainer>
    </>
  );
}
export default Landing;
