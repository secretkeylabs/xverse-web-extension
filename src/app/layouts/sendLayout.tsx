import AccountHeaderComponent from '@components/accountHeader';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useWalletSelector from '@hooks/useWalletSelector';
import { isInOptions, type TabType } from '@utils/helper';
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
  padding-top: ${(props) => props.theme.space.xs};
  padding-bottom: ${(props) => props.theme.space.xxs};
  padding: 0 ${(props) => props.theme.space.xs};
  width: 100%;
  height: 100%;
  max-width: ${breakpoints.xs}px;
  max-height: 600px;
  flex: 1;

  @media only screen and ${devices.min.s} {
    max-width: 588px;
    max-height: unset;
    padding: 0 ${(props) => props.theme.space.xs};
    margin-bottom: ${(props) => props.theme.space.m};
  }
`;

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

function SendLayout({
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
  const isInOption = isInOptions();
  const { hasBackedUpWallet } = useWalletSelector();

  return (
    <>
      {showAccountHeader ? (
        <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      ) : (
        <TopRow
          backupReminder={!hasBackedUpWallet}
          onClick={onClickBack!}
          showBackButton={!hideBackButton && !!onClickBack}
        />
      )}
      <ScrollContainer>
        <Container>{children}</Container>
      </ScrollContainer>
      <BottomBarContainer>
        {!isInOption && !hideBottomBar && <BottomBar tab={selectedBottomTab} />}
      </BottomBarContainer>
    </>
  );
}

export default SendLayout;
