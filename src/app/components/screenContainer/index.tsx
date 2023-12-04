import useWalletSelector from '@hooks/useWalletSelector';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { devices } from 'theme';

const RouteContainer = styled.div`
  // any route should default to the chrome extension window size
  display: flex;
  flex-direction: column;
  height: 600px;
  width: 360px;
  margin: auto;
  background-color: ${(props) => props.theme.colors.elevation0};
  border: 1px solid rgba(126, 137, 171, 0.2);
  box-shadow: 0px 8px 28px rgba(0, 0, 0, 0.35);

  // set some basic responsive properties here for when we load routes
  // in either full screen tabs or popup windows
  @media only screen and ${devices.min.s} {
    max-width: 588px;
    min-height: 600px;
    max-height: unset;
    height: auto;
  }
`;

const TestnetContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: props.theme.colors.elevation1,
  paddingTop: props.theme.spacing(3),
  paddingBottom: props.theme.spacing(3),
}));

const TestnetText = styled.h1((props) => ({
  ...props.theme.typography.body_s,
  textAlign: 'center',
  color: props.theme.colors.white_200,
}));

function ScreenContainer(): JSX.Element {
  const { network } = useWalletSelector();
  const { t } = useTranslation('translation');

  return (
    <RouteContainer>
      {network.type === 'Testnet' && (
        <TestnetContainer>
          <TestnetText>{t('SETTING_SCREEN.TESTNET')}</TestnetText>
        </TestnetContainer>
      )}
      <Outlet />
    </RouteContainer>
  );
}

export default ScreenContainer;
