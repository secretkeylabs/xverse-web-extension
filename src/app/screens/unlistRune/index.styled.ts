import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
  padding: 0 ${(props) => props.theme.space.m};
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Header = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.space.m,
}));

export const UnlistRunesContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.s,
  marginTop: props.theme.space.l,
}));

export const NoItemsContainer = styled.div((props) => ({
  padding: `${props.theme.space.m} ${props.theme.space.s}`,
}));
