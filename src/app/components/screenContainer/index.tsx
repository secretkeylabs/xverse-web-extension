import xverseLogoIcon from '@assets/img/full_logo_horizontal.svg';
import VerticalTabBar from '@components/tabBarVertical';
import useWalletSelector from '@hooks/useWalletSelector';
import { StyledP } from '@ui-library/common.styled';
import { getActiveTab, isInOptions } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { devices } from 'theme';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  min-height: 100vh;

  @media ${devices.min.xs} {
    max-height: 100vh;
    overflow-y: auto;
  }
`;

const RouteContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin: auto;
  background-color: ${(props) => props.theme.colors.elevation0};
  border: 1px solid ${(props) => props.theme.colors.white_900};

  @media ${devices.min.xs} {
    border-radius: ${(props) => props.theme.radius(2)}px;
  }

  @media ${devices.min.md} {
    width: 588px;
    min-height: 600px;
    max-height: 800px;
    margin-top: ${(props) => props.theme.space.m};
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

const TestnetText = styled.p((props) => ({
  ...props.theme.typography.body_s,
  textAlign: 'center',
  color: props.theme.colors.white_200,
}));

const FullScreenHeader = styled.div((props) => ({
  display: 'none',
  width: '100%',
  paddingTop: 28,
  paddingLeft: props.theme.space.xxl,
  paddingBottom: props.theme.space.l,
  [`@media ${devices.min.md}`]: {
    display: 'block',
  },
}));

const XverseLogo = styled.img({
  width: '99px',
  height: '18px',
});

const FooterContainer = styled.div`
  display: none;

  @media ${devices.min.md} {
    display: flex;
    justify-content: center;
    margin-top: ${(props) => props.theme.space.xl};
    margin-bottom: ${(props) => props.theme.space.xxl};
  }
`;

const Sidebar = styled(VerticalTabBar)`
  display: none;

  @media ${devices.min.md} {
    display: flex;
  }
`;

function ScreenContainer({
  isSidebarVisible = false,
}: {
  isSidebarVisible?: boolean;
}): JSX.Element {
  const { network } = useWalletSelector();
  const { t } = useTranslation('translation');
  const year = new Date().getFullYear();
  const location = useLocation();
  const isInOption = isInOptions();

  return (
    <Container>
      {isInOption && isSidebarVisible && <Sidebar tab={getActiveTab(location.pathname)} />}
      <ContentContainer>
        {isInOption && (
          <FullScreenHeader>
            <XverseLogo src={xverseLogoIcon} />
          </FullScreenHeader>
        )}
        <RouteContainer>
          {network.type === 'Testnet' && (
            <TestnetContainer>
              <TestnetText>{t('SETTING_SCREEN.TESTNET')}</TestnetText>
            </TestnetContainer>
          )}
          {network.type === 'Signet' && (
            <TestnetContainer>
              <TestnetText>{t('SETTING_SCREEN.SIGNET')}</TestnetText>
            </TestnetContainer>
          )}
          <Outlet />
        </RouteContainer>
        {isInOption && (
          <FooterContainer>
            <StyledP typography="body_medium_m" color="white_400">
              {t('SEND.COPYRIGHT', { year })}
            </StyledP>
          </FooterContainer>
        )}
      </ContentContainer>
      <div />
    </Container>
  );
}

export default ScreenContainer;
