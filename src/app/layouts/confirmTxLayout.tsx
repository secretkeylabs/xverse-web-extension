import AccountHeaderComponent from '@components/accountHeader';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { ArrowLeft } from '@phosphor-icons/react';
import type { TabType } from '@utils/helper';
import type { PropsWithChildren } from 'react';
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
  margin-top: ${(props) => props.theme.space.xs};
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
  }
`;

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border-radius: 24px;
  padding: 5px;
  width: 30px;
  margin-bottom: ${(props) => props.theme.space.l};
  :hover {
    background-color: ${(props) => props.theme.colors.white_900};
  }
`;

function ConfirmTxLayout({
  children,
  selectedBottomTab,
  onClickBack,
  hideBackButton = false,
  showAccountHeader = false,
  hideBottomBar = false,
}: PropsWithChildren<{
  selectedBottomTab: TabType;
  onClickBack?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  hideBackButton?: boolean;
  showAccountHeader?: boolean;
  hideBottomBar?: boolean;
}>) {
  const isScreenLargerThanXs = document.documentElement.clientWidth > Number(breakpoints.xs);

  return (
    <>
      {showAccountHeader ? (
        <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      ) : (
        <TopRow onClick={onClickBack!} showBackButton={!hideBackButton && !!onClickBack} />
      )}
      <ScrollContainer>
        <Container>
          {showAccountHeader && !hideBackButton && onClickBack && (
            <Button onClick={onClickBack}>
              <ArrowLeft size={20} color="white" />
            </Button>
          )}
          {children}
        </Container>
      </ScrollContainer>
      <BottomBarContainer>
        {!isScreenLargerThanXs && !hideBottomBar && <BottomBar tab={selectedBottomTab} />}
      </BottomBarContainer>
    </>
  );
}

export default ConfirmTxLayout;
