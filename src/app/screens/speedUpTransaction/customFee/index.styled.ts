import ActionButton from '@components/button';
import FiatAmountText from '@components/fiatAmountText';
import { InputFeedback } from '@ui-library/inputFeedback';
import styled from 'styled-components';

export const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

export const InfoContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: props.theme.spacing(6),
  minHeight: 20,
}));

export const TotalFeeText = styled.span((props) => ({
  ...props.theme.typography.body_medium_m,
  display: 'flex',
  columnGap: props.theme.spacing(2),
  color: props.theme.colors.white_200,
}));

export const InputContainer = styled.div<{ withError?: boolean }>((props) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: `1px solid ${
    props.withError ? props.theme.colors.danger_dark_200 : props.theme.colors.white_800
  }`,
  backgroundColor: props.theme.colors.elevation1,
  borderRadius: props.theme.radius(1),
  marginTop: props.theme.spacing(4),
  padding: props.theme.spacing(6),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

export const InputField = styled.input((props) => ({
  ...props.theme.typography.body_medium_m,
  backgroundColor: 'transparent',
  color: props.theme.colors.white_200,
  border: 'transparent',
  width: '70%',
  '&::-webkit-outer-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '&::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '&[type=number]': {
    '-moz-appearance': 'textfield',
  },
}));

export const InputLabel = styled.span((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
}));

export const FeeText = styled.span((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

export const FeeContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

export const ControlsContainer = styled.div`
  display: flex;
  gap: 12px;
  margin: 24px 16px 40px;
`;

export const StyledInputFeedback = styled(InputFeedback)`
  margin-top: ${(props) => props.theme.spacing(2)}px;
`;

export const StyledFiatAmountText = styled(FiatAmountText)((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
}));

export const StyledActionButton = styled(ActionButton)((props) => ({
  'div, h1': {
    ...props.theme.typography.body_medium_m,
  },
}));
