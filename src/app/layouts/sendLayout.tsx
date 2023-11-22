import AccountHeaderComponent from '@components/accountHeader';
import BottomBar, { Tab } from '@components/tabBar';
import TopRow from '@components/topRow';
import { ArrowLeft } from '@phosphor-icons/react';
import { StyledP } from '@ui-library/common.styled';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { breakpoints, devices } from 'theme';

const ScrollContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  ...props.theme.scrollbar,
}));

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  margin-top: ${(props) => props.theme.space.xxs};
  padding: 0 ${(props) => props.theme.space.s};
  width: 100%;
  height: 100%;
  max-width: ${breakpoints.xs}px;
  max-height: 600px;

  @media only screen and ${devices.min.s} {
    flex: initial;
    max-width: 588px;
    border: 1px solid ${(props) => props.theme.colors.elevation3};
    border-radius: ${(props) => props.theme.space.s};
    padding: ${(props) => props.theme.space.l} ${(props) => props.theme.space.m};
    padding-bottom: ${(props) => props.theme.space.xxl};
    margin-top: ${(props) => props.theme.space.xxxxl};
  }
`;

const FooterContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.space.xxl};
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
}: PropsWithChildren<{
  selectedBottomTab: Tab;
  onClickBack?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  hideBackButton?: boolean;
}>) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const isScreenLargerThanXs = document.documentElement.clientWidth > Number(breakpoints.xs);
  const year = new Date().getFullYear();

  return (
    <>
      {isScreenLargerThanXs ? (
        <AccountHeaderComponent disableMenuOption={isScreenLargerThanXs} disableAccountSwitch />
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
        {isScreenLargerThanXs && (
          <FooterContainer>
            <StyledP typography="body_medium_m" color="white_400">
              {t('COPYRIGHT', { year })}
            </StyledP>
          </FooterContainer>
        )}
      </ScrollContainer>
      <BottomBarContainer>
        {!isScreenLargerThanXs && <BottomBar tab={selectedBottomTab} />}
      </BottomBarContainer>
    </>
  );
}

export default SendLayout;
