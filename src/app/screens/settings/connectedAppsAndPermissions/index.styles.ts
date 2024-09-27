/* eslint-disable import/prefer-default-export */

import { Globe } from '@phosphor-icons/react';
import styled from 'styled-components';

export const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
}));

export const Client = styled('button')((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: props.theme.colors.elevation1,
  padding: props.theme.space.s,
  marginBottom: props.theme.space.s,
  borderRadius: props.theme.space.s,
}));

export const ClientDescription = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const ClientHeader = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

export const DappIconPlaceholder = styled(Globe)((props) => ({
  width: 32,
  height: 32,
  marginRight: props.theme.space.s,
}));

export const DappIcon = styled('img')((props) => ({
  width: 32,
  height: 32,
  marginRight: props.theme.space.s,
  borderRadius: props.theme.radius(1),
}));

export const PermissionContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

export const ButtonContainer = styled('div')((props) => ({
  marginTop: 'auto',
  marginBottom: props.theme.space.l,
}));

export const ClientName = styled('div')((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

export const ClientPropertyContainer = styled('div')((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.space.xs,
}));

export const Row = styled('div')((props) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: props.theme.space.m,
}));

export const ClientProperty = styled('div')((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
}));

export const ClientPropertyValue = styled('div')((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

export const PermissionText = styled('div')(({ theme, color }) => ({
  ...theme.typography.body_m,
  color: color || theme.colors.white_0,
  textTransform: 'capitalize',
}));
