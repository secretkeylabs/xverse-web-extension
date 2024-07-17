import { InputFeedback } from '@ui-library/inputFeedback';
import styled from 'styled-components';

interface ContainerProps {
  error: boolean;
}

export const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  margin-left: 5%;
  margin-right: 5%;
`;

export const OuterContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: props.theme.spacing(32.5),
  flex: 1,
}));

export const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

export const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(16),
}));

export const OrdinalInfoContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(6),
}));

export const MemoContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(3),
  marginBottom: props.theme.spacing(6),
}));

export const ErrorText = styled.p((props) => ({
  ...props.theme.typography.body_s,
  color: props.theme.colors.danger_medium,
}));

export const InputFieldContainer = styled.div(() => ({
  flex: 1,
}));

export const TitleText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  flex: 1,
  display: 'flex',
}));

export const Text = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
}));

export const SubText = styled.p((props) => ({
  ...props.theme.typography.body_s,
  display: 'flex',
  flex: 1,
  color: props.theme.colors.white_400,
}));

export const AssociatedText = styled.p((props) => ({
  ...props.theme.typography.body_s,
  wordWrap: 'break-word',
}));

export const BalanceText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  marginRight: props.theme.spacing(2),
}));

export const InputField = styled.input((props) => ({
  ...props.theme.typography.body_m,
  backgroundColor: props.theme.colors.elevation_n1,
  color: props.theme.colors.white_0,
  width: '100%',
  border: 'transparent',
}));

export const AmountInputContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
  border: props.error
    ? '1px solid rgba(211, 60, 60, 0.3)'
    : `1px solid ${props.theme.colors.elevation3}`,
  backgroundColor: props.theme.colors.elevation_n1,
  borderRadius: props.theme.radius(1),
  paddingLeft: props.theme.spacing(5),
  paddingRight: props.theme.spacing(5),
  height: 44,
  ':focus-within': {
    border: `1px solid ${props.theme.colors.elevation6}`,
  },
}));

export const MemoInputContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
  border: props.error
    ? '1px solid rgba(211, 60, 60, 0.3)'
    : `1px solid ${props.theme.colors.elevation3}`,
  backgroundColor: props.theme.colors.elevation_n1,
  borderRadius: props.theme.radius(1),
  padding: props.theme.spacing(7),
  height: 76,
  ':focus-within': {
    border: `1px solid ${props.theme.colors.elevation6}`,
  },
}));

export const SendButtonContainer = styled.div((props) => ({
  paddingBottom: props.theme.spacing(12),
  paddingTop: props.theme.spacing(4),
  marginLeft: '5%',
  marginRight: '5%',
}));

export const CurrencyFlag = styled.img((props) => ({
  marginLeft: props.theme.spacing(4),
}));

export const TokenContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(8),
}));

export const StyledInputFeedback = styled(InputFeedback)((props) => ({
  marginBottom: props.theme.spacing(4),
}));
