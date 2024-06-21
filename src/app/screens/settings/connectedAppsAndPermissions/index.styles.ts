/* eslint-disable import/prefer-default-export */

import styled from 'styled-components';

export const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: props.theme.spacing(20),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

export const ClientName = styled('div')({
  fontWeight: 'bold',
});

export const Row = styled('div')({
  paddingLeft: '10px',
});

export const PermissionContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

export const PermissionTitle = styled('div')({
  fontWeight: 'bold',
});

export const PermissionDescription = styled('div')({
  paddingLeft: '10px',
});
