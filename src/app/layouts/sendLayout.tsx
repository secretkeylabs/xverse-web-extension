import AccountHeaderComponent from '@components/accountHeader';
import BottomBar, { Tab } from '@components/tabBar';
import TopRow from '@components/topRow';
import { ArrowLeft } from '@phosphor-icons/react';
import { StyledP } from '@ui-library/common.styled';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { breakpoints, devices } from 'theme';

const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  ${(props) => props.theme.scrollbar}
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  margin-top: ${(props) => props.theme.space.m};
  margin-bottom: ${(props) => props.theme.space.xxs};
  padding: 0 ${(props) => props.theme.space.xs};
  width: 100%;
  height: 100%;
  max-width: ${breakpoints.xs}px;
  max-height: 600px;

  @media only screen and ${devices.min.s} {
    flex: initial;
    max-width: 588px;
    max-height: unset;
    height: auto;
    border: 1px solid ${(props) => props.theme.colors.elevation3};
    border-radius: ${(props) => props.theme.space.s};
    padding-top: ${(props) => props.theme.space.l};
    padding-left: ${(props) => props.theme.space.m};
    padding-right: ${(props) => props.theme.space.m};
    padding-bottom: ${(props) => props.theme.space.xxl};
    margin-top: ${(props) => props.theme.space.xxxxl};
    margin-bottom: ${(props) => props.theme.space.m};
  }
`;

const FooterContainer = styled.div`
  display: none;

  @media only screen and ${devices.min.s} {
    display: flex;
    justify-content: center;
    margin-bottom: ${(props) => props.theme.space.xxl};
  }
`;

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

const Button = styled.button`
  display: flex;
  background-color: transparent;
  margin-bottom: ${(props) => props.theme.space.l};
`;

function SendLayout({
  children,
  selectedBottomTab,
  onClickBack,
  hideBackButton = false,
  showAccountHeader = false,
  hideBottomBar = false,
}: PropsWithChildren<{
  selectedBottomTab: Tab;
  onClickBack?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  hideBackButton?: boolean;
  showAccountHeader?: boolean;
  hideBottomBar?: boolean;
}>) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const isScreenLargerThanXs = document.documentElement.clientWidth > Number(breakpoints.xs);
  const year = new Date().getFullYear();

  return (
    <>
      {isScreenLargerThanXs || showAccountHeader ? (
        <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      ) : (
        <TopRow title="" onClick={onClickBack!} showBackButton={!hideBackButton && !!onClickBack} />
      )}
      <ScrollContainer>
        <Container>
          {isScreenLargerThanXs && !hideBackButton && onClickBack && (
            <Button onClick={onClickBack}>
              <ArrowLeft size={20} color="white" />
            </Button>
          )}
          {children}
        </Container>
        <FooterContainer>
          <StyledP typography="body_medium_m" color="white_400">
            {t('COPYRIGHT', { year })}
          </StyledP>
        </FooterContainer>
      </ScrollContainer>
      <BottomBarContainer>
        {!isScreenLargerThanXs && !hideBottomBar && <BottomBar tab={selectedBottomTab} />}
      </BottomBarContainer>
    </>
  );
}

export default SendLayout;
