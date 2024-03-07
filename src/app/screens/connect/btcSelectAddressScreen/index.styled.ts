import styled from 'styled-components';

export const OuterContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  ...props.theme.scrollbar,
}));

export const HeadingContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 48,
});

export const AddressBoxContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  marginTop: props.theme.spacing(12),
}));

export const TopImage = styled.img((props) => ({
  maxHeight: 48,
  borderRadius: props.theme.radius(2),
  maxWidth: 48,
  marginBottom: props.theme.space.m,
}));

export const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  color: props.theme.colors.white_0,
}));

export const DapURL = styled.h2((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  marginTop: props.theme.spacing(2),
  textAlign: 'center',
}));

export const RequestMessage = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  textAlign: 'left',
  wordWrap: 'break-word',
  marginTop: props.theme.spacing(12),
  marginBottom: props.theme.spacing(12),
}));

export const PermissionsContainer = styled.div((props) => ({
  paddingBottom: props.theme.space.xxl,
}));

export const LoaderContainer = styled.div(() => ({
  justifySelf: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
}));
