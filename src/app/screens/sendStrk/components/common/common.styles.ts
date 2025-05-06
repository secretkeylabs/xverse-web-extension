import styled from 'styled-components';

export const StyledForm = styled.form(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.space.l,
  width: '100%',
}));
