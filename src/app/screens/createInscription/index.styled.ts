import Callout from '@ui-library/callout';
import styled from 'styled-components';

export const YourAddress = styled.div`
  text-align: right;
`;

export const OuterContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const MainContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  flex: 1,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

export const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  marginTop: props.theme.spacing(11),
  color: props.theme.colors.white_0,
  textAlign: 'left',
}));

export const SubTitle = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  marginTop: props.theme.spacing(4),
  textAlign: 'left',
  marginBottom: props.theme.spacing(12),
}));

export const StyledCallout = styled(Callout)`
  margin-bottom: ${(props) => props.theme.space.m};
`;

export const CardContainer = styled.div<{ bottomPadding?: boolean }>((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.m,
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: props.theme.spacing(8),
  paddingBottom: props.bottomPadding ? props.theme.spacing(12) : props.theme.spacing(8),
  justifyContent: 'center',
  marginBottom: props.theme.spacing(6),
  fontSize: 14,
}));

export const IconLabel = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const ButtonIcon = styled.img((props) => ({
  width: 32,
  height: 32,
  marginRight: props.theme.spacing(4),
}));

export const InfoIconContainer = styled.div((props) => ({
  background: props.theme.colors.white_0,
  color: props.theme.colors.elevation0,
  width: 32,
  height: 32,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  marginRight: props.theme.spacing(5),
}));

export const EditFeesButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  width: '100%',
  marginTop: props.theme.spacing(10),
}));

export const ButtonText = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

export const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

export const SuccessActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.s,
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  marginBottom: props.theme.space.xxl,
  marginTop: props.theme.space.xxl,
}));

export const CardRow = styled.div<{
  topMargin?: boolean;
  center?: boolean;
}>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: props.center ? 'center' : 'flex-start',
  justifyContent: 'space-between',
  marginTop: props.topMargin ? props.theme.spacing(8) : 0,
}));

export const NumberWithSuffixContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  color: props.theme.colors.white_0,
}));

export const NumberSuffix = styled.div((props) => ({
  ...props.theme.typography.body_s,
  color: props.theme.colors.white_400,
}));

export const StyledPillLabel = styled.p`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.space.s};
`;

export const Pill = styled.span`
  ${(props) => props.theme.typography.body_bold_s}
  color: ${(props) => props.theme.colors.elevation0};
  background-color: ${(props) => props.theme.colors.white_0};
  padding: 3px 6px;
  border-radius: 40px;
`;
