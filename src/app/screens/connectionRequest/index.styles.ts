import styled from 'styled-components';

export const Row = styled('div')({
  display: 'flex',
  justifyContent: 'space-around',
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
