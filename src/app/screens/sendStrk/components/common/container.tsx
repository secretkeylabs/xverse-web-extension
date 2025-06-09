import styled from 'styled-components';

export const Container = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: theme.space.l,
}));
