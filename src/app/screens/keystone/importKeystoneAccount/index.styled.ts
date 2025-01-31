import { animated } from '@react-spring/web';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const OnBoardingContentContainer = styled(animated.div)((props) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  flex: 1,
  justifyContent: props.className === 'center' ? 'center' : 'none',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

export const OnBoardingActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(30),
}));
