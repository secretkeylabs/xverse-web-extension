import { StyledP } from '@ui-library/common.styled';
import styled from 'styled-components';

export const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  ${(props) => props.theme.scrollbar}
`;

export const TokenContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${(props) => props.theme.space.xl};
  > *:not(:last-child) {
    border-bottom: 1px solid ${(props) => props.theme.colors.elevation3};
  }
`;

export const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  height: '100%',
}));

export const FtInfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: props.theme.space.m,
}));

export const Header = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  marginBottom: props.theme.space.m,
}));

export const Description = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.xl,
}));

export const ErrorsText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.space.xl,
  marginBottom: 'auto',
  textAlign: 'center',
}));

export const ButtonRow = styled.button`
  display: flex;
  align-items: center;
  background-color: transparent;
  flex-direction: row;
  padding-left: ${(props) => props.theme.space.m};
  padding-right: ${(props) => props.theme.space.m};
  padding-top: ${(props) => props.theme.space.s};
  padding-bottom: ${(props) => props.theme.space.s};
  transition: background-color 0.2s ease;
  :hover {
    background-color: ${(props) => props.theme.colors.elevation3};
  }
  :active {
    background-color: ${(props) => props.theme.colors.elevation3};
  }
`;

export const TokenText = styled(StyledP)`
  margin-left: ${(props) => props.theme.space.m};
`;
