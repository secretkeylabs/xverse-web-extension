import styled from 'styled-components';

export const OuterContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

export const Container = styled.div((props) => ({
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(12),
  borderBottom: `1px solid ${props.theme.colors.elevation3}`,
}));

export const StackingInfoContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(8),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'space-between',
}));

export const ButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(16),
}));

export const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

export const TitleText = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginTop: props.theme.spacing(16),
}));

export const StackingDescriptionText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(12),
  color: props.theme.colors.white_200,
}));
