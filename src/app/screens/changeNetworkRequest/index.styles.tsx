import { animated, useSpring } from '@react-spring/web';
import type { ReactNode } from 'react';
import styled from 'styled-components';

const ContainerInner = styled(animated.div)((props) => ({
  flexGrow: 1,

  display: 'flex',
  flexDirection: 'column',

  paddingBlockStart: '48px', // Value not available in theme.
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  ...props.theme.scrollbar,
}));
export function Container({ children }: { children: ReactNode }) {
  const [styles] = useSpring(
    {
      from: {
        opacity: 0,
        y: 24,
      },
      to: {
        y: 0,
        opacity: 1,
      },
    },
    [],
  );
  return <ContainerInner style={styles}>{children}</ContainerInner>;
}

export const ContentContainer = styled('div')({
  flexGrow: 1,
});

export const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

export const InfoMessage = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  textAlign: 'center',
  wordWrap: 'break-word',
  marginTop: props.theme.space.xxl,
}));

export const DappInfoTextContainer = styled('div')((props) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: props.theme.space.xxs,
}));

export const NetworkChangeContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: props.theme.space.l,
  paddingLeft: props.theme.space.xl,
  paddingRight: props.theme.space.xl,
}));

export const Pill = styled.div<{ color?: string }>((props) => ({
  display: 'flex',
  alignItems: 'center',
  color: props.color || props.theme.colors.white_400,
  padding: '7px 12px',
  borderRadius: 12,
  border: `1px solid ${props.theme.colors.white_900}`,
}));

export const PillLabel = styled.p<{ color?: string }>((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.color || props.theme.colors.white_400,
  marginLeft: props.theme.space.xxs,
}));
