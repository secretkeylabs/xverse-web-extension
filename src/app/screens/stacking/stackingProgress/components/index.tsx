import styled from 'styled-components';

export const Container = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: props.theme.colors.elevation1,
  borderRadius: props.theme.radius(2),
  padding: props.theme.spacing(9),
}));

export const TextContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
});

export const StatusContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'rgba(81, 214, 166, 0.15)',
  borderRadius: props.theme.radius(7),
  paddingLeft: props.theme.spacing(7),
  paddingRight: props.theme.spacing(7),
  paddingTop: props.theme.spacing(4),
  paddingBottom: props.theme.spacing(4),
}));

export const Dot = styled.div((props) => ({
  width: 7,
  height: 7,
  borderRadius: props.theme.radius(9),
  marginRight: props.theme.spacing(4),
  background: props.theme.colors.feedback.success,
}));

export const ColumnContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginLeft: props.theme.spacing(6),
}));

export const BoldText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white_0,
}));

export const SubText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white_400,
}));

export const StatusText = styled.h1((props) => ({
  ...props.theme.body_xs,
  fontWeight: 500,
  color: props.theme.colors.white_0,
}));

export const Icon = styled.img({
  width: 36,
  height: 36,
});
