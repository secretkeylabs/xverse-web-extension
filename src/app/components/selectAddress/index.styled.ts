import { animated } from '@react-spring/web';
import styled from 'styled-components';

export const Container = styled.div((_) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'hidden',
}));

export const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
}));

export const TabsContainer = styled.div((props) => ({
  marginTop: props.theme.space.l,
  marginBottom: props.theme.space.l,
}));

export const ListContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.m,
  height: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
  ...props.theme.scrollbar,
}));

export const Subtitle = styled.p((props) => ({
  ...props.theme.typography.body_bold_s,
  color: props.theme.colors.white_200,
  textTransform: 'uppercase',
}));

export const LoaderContainer = styled.div((_) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}));

export const TabContentContainer = styled.div`
  position: relative;
  flex: 1;
  overflow: hidden;
`;

export const AnimatedContent = styled(animated.div)`
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
`;
