import useWalletSelector from '@hooks/useWalletSelector';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

const ExtendedScreenRouteContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100vw',
  backgroundColor: props.theme.colors.background.elevation0,
  border: `1px solid ${props.theme.colors.background.elevation2}`,
  boxShadow: '0px 8px 28px rgba(0, 0, 0, 0.35)',
}));

const TestnetContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: props.theme.colors.background.elevation1,
  paddingTop: props.theme.spacing(3),
  paddingBottom: props.theme.spacing(3),
}));

const TestnetText = styled.h1((props) => ({
  ...props.theme.body_xs,
  textAlign: 'center',
  color: props.theme.colors.white_200,
}));

function ExtendedScreenContainer(): JSX.Element {
  const { network } = useWalletSelector();
  const { t } = useTranslation('translation');

  return (
    <ExtendedScreenRouteContainer>
      {network.type === 'Testnet' && (
        <TestnetContainer>
          <TestnetText>{t('SETTING_SCREEN.TESTNET')}</TestnetText>
        </TestnetContainer>
      )}
      <Outlet />
    </ExtendedScreenRouteContainer>
  );
}

export default ExtendedScreenContainer;
