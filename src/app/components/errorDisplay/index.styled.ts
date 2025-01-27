import styled from 'styled-components';
import { devices } from '../../../theme';

export const ScreenContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  min-height: 100vh;

  @media ${devices.min.xs} {
    max-height: 100vh;
    overflow-y: auto;
  }
`;

export const RouteContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin: auto;
  background-color: ${(props) => props.theme.colors.elevation0};
  border: 1px solid ${(props) => props.theme.colors.white_900};

  @media ${devices.min.xs} {
    border-radius: ${(props) => props.theme.radius(2)}px;
  }

  @media ${devices.min.md} {
    width: 588px;
    min-height: 600px;
    max-height: 800px;
    margin-top: ${(props) => props.theme.space.m};
  }
`;

export const TestnetContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: props.theme.colors.elevation1,
  paddingTop: props.theme.spacing(3),
  paddingBottom: props.theme.spacing(3),
  borderTopLeftRadius: 'inherit',
  borderTopRightRadius: 'inherit',
}));

export const TestnetText = styled.p((props) => ({
  ...props.theme.typography.body_s,
  textAlign: 'center',
  color: props.theme.colors.white_200,
}));

export const ErrorContents = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  paddingTop: '15%',
  paddingBottom: '15%',
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  gap: props.theme.space.m,
}));

export const ErrorTitle = styled.div((props) => ({
  ...props.theme.typography.headline_xl,
  color: props.theme.colors.white_0,
}));

export const ErrorSubtitle = styled.div((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
}));

export const ErrorDescription = styled.div((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
}));

export const SupportEmail = styled.a((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_0,
}));

export const ErrorStackContainer = styled.div((props) => ({
  marginTop: props.theme.space.xs,
}));

export const StackToggle = styled.div((props) => ({
  ...props.theme.typography.body_m,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  color: props.theme.colors.tangerine_light,
  width: 'fit-content',
  cursor: 'pointer',
  gap: '2px',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

export const IconContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const StackDetails = styled.div((props) => ({
  ...props.theme.typography.body_m,
  marginTop: props.theme.space.l,
  borderRadius: props.theme.radius(2),
  color: props.theme.colors.white_200,
}));

export const InfoWarning = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  gap: props.theme.space.m,
  padding: props.theme.space.m,
  backgroundColor: props.theme.colors.caution_800,
  borderRadius: props.theme.radius(2),
  color: props.theme.colors.white_200,
}));

export const ErrorDetailsSection = styled.div((props) => ({
  ...props.theme.typography.body_m,
  marginTop: props.theme.space.xl,
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.xs,
}));

export const ErrorDetailTitle = styled.div((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
}));

export const ErrorCode = styled.div((props) => ({
  ...props.theme.typography.body_s,
  display: 'flex',
  marginTop: props.theme.space.m,
  backgroundColor: props.theme.colors.elevation1,
  border: `1px solid ${props.theme.colors.white_900}`,
  borderRadius: props.theme.radius(2),
  padding: props.theme.space.m,
  paddingBottom: props.theme.space.l,
  '& pre': {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
}));

export const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.s};
  margin-top: ${(props) => props.theme.space.xl};
`;

export const FullScreenHeader = styled.div((props) => ({
  display: 'none',
  width: '100%',
  paddingTop: 28,
  paddingLeft: props.theme.space.xxl,
  paddingBottom: props.theme.space.l,
  [`@media ${devices.min.md}`]: {
    display: 'block',
  },
}));

export const XverseLogo = styled.img({
  width: '99px',
  height: '18px',
});

export const FooterContainer = styled.div`
  display: none;

  @media ${devices.min.md} {
    display: flex;
    justify-content: center;
    margin-top: ${(props) => props.theme.space.xl};
    margin-bottom: ${(props) => props.theme.space.xxl};
  }
`;
