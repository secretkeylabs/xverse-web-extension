import { animated } from '@react-spring/web';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import styled from 'styled-components';

export const Container = styled.div`
  flex: 1;

  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const Buttons = styled.div`
  margin: ${(props) => props.theme.space.l} 0;
`;

export const SaveAddressButton = styled(Button)`
  margin-top: ${(props) => props.theme.space.m};
`;

export const SaveAddressForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.l};
  padding-bottom: ${(props) => props.theme.space.l};
`;

export const Feedback = styled.div`
  margin-top: ${(props) => props.theme.space.xs};
`;

export const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${(props) => props.theme.space.l};
`;

export const HeaderTitle = styled.div`
  ${(props) => props.theme.typography.headline_xs};
`;

export const HeaderButton = styled(Button)`
  ${({ theme }) => theme.typography.body_medium_m};
  max-width: 150px;
  padding: ${(props) => props.theme.space.xs} ${(props) => props.theme.space.s};
  padding-right: ${(props) => props.theme.space.m};
  gap: ${(props) => props.theme.space.xs};
  min-height: initial;
`;

export const RecipientLabel = styled(StyledP)`
  margin-bottom: ${(props) => props.theme.space.xs};
`;

export const MainScreenContainer = styled(animated.div)`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-x: hidden;
  position: relative;
`;

export const TransitionWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
`;
