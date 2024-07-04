import { animated, useSpring } from '@react-spring/web';
import { ReactNode } from 'react';
import styled from 'styled-components';

const ContainerInner = styled(animated.div)((props) => ({
  flexGrow: 1,

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

export const PermissionDescriptionsContainer = styled('div')((props) => ({
  paddingBlockStart: props.theme.space.l,
}));

export const AccountSwitcherContainer = styled('div')((props) => ({
  paddingBlockStart: props.theme.space.l,
}));
