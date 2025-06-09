import { StyledP } from '@ui-library/common.styled';
import styled from 'styled-components';

export const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  ${(props) => props.theme.scrollbar}
`;

export const Container = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  marginTop: props.theme.space.xs,
  flexDirection: 'column',
  paddingBottom: props.theme.space.xl,
}));

export const SecondaryContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  marginTop: props.theme.space.m,
  marginBottom: props.theme.space.xl,
  h1: {
    ...props.theme.typography.body_medium_m,
    color: props.theme.colors.white_400,
  },
}));

export const ContractAddressCopyButton = styled.button((props) => ({
  display: 'flex',
  marginTop: props.theme.space.xxs,
  background: 'transparent',
}));

export const TokenContractAddress = styled.p((props) => ({
  ...props.theme.typography.body_medium_l,
  color: props.theme.colors.white_0,
  textAlign: 'left',
  overflowWrap: 'break-word',
  width: 300,
}));

export const FtInfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  borderTop: `1px solid ${props.theme.colors.elevation2}`,
  paddingTop: props.theme.space.m,
  marginTop: props.theme.space.m,
  paddingLeft: props.theme.space.m,
}));

export const ShareIcon = styled.img({
  width: 18,
  height: 18,
});

export const CopyButtonContainer = styled.div((props) => ({
  marginRight: props.theme.space.xxs,
}));

export const ContractDeploymentButton = styled.button((props) => ({
  ...props.theme.typography.body_m,
  display: 'flex',
  alignItems: 'center',
  marginTop: props.theme.space.l,
  background: 'none',
  color: props.theme.colors.white_400,
  span: {
    color: props.theme.colors.white_0,
    marginLeft: props.theme.space.xs,
  },
  img: {
    marginLeft: props.theme.space.xs,
  },
}));

export const Button = styled.button<{
  isSelected: boolean;
}>((props) => ({
  ...props.theme.typography.body_bold_l,
  fontSize: 11,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 31,
  paddingLeft: props.theme.space.s,
  paddingRight: props.theme.space.s,
  marginRight: props.theme.space.xxs,
  borderRadius: 44,
  background: props.isSelected ? props.theme.colors.elevation2 : 'transparent',
  color: props.theme.colors.white_0,
  opacity: props.isSelected ? 1 : 0.6,
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

export const RuneBundlesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.s};
`;

export const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${(props) => props.theme.space.l};
  padding-left: ${(props) => props.theme.space.m};
  padding-right: ${(props) => props.theme.space.m};
`;
