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

export const PermissionDescriptionsContainer = styled('div')((props) => ({
  paddingBlockStart: props.theme.space.l,
}));

export const AccountSwitcherContainer = styled('div')((props) => ({
  paddingBlockStart: props.theme.space.l,
}));

export const AddressBoxContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  marginTop: props.theme.space.l,
}));

export const RequestMessage = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  textAlign: 'left',
  wordWrap: 'break-word',
  marginTop: props.theme.space.l,
}));

export const DappInfoContainer = styled('div')((props) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: props.theme.space.m,
}));

export const DappInfoTextContainer = styled('div')((props) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: props.theme.space.xxs,
}));
