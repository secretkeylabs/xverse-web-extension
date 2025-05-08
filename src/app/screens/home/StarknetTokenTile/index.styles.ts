import styled from 'styled-components';

export const Container = styled('button')((props) => ({
  display: 'flex',
  columnGap: props.theme.space.m,
  alignItems: 'flex-start',
  paddingBlock: props.theme.space.m,
  width: '100%',
  background: 'transparent',
  borderRadius: props.theme.radius(2),
}));

export const ContentContainer = styled.div(({ theme }) => ({
  flexGrow: 1,

  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.space.xxxs,
}));

export const RowContainer = styled.div((props) => ({
  display: 'flex',
  columnGap: props.theme.space.m,
  justifyContent: 'space-between',
  alignItems: 'center',
}));
