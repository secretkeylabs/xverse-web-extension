import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 0;
  padding: ${({ theme }) => theme.space.s} ${({ theme }) => theme.space.m};

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ContentContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  rowGap: theme.space.l,
  height: 0,
}));

export const ContentBodyContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  height: 0,
  overflowY: 'auto',
});

export const Heading = styled.div(({ theme }) => ({
  ...theme.typography.headline_xs,
  color: theme.colors.white_0,
  textAlign: 'center',
}));
