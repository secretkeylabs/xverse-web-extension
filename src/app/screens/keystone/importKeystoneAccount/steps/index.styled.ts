import styled from 'styled-components';

export const ImportStartImage = styled.img((props) => ({
  marginLeft: props.theme.spacing(0),
}));

export const ImportStartContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '328px',
});

export const ImportBeforeStartContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '328px',
  paddingTop: props.theme.spacing(16),
}));

export const ImportStartTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginTop: props.theme.spacing(40),
  textAlign: 'center',
}));
export const ImportStartText = styled.p((props) => ({
  ...props.theme.body_m,
  textAlign: 'center',
  marginTop: props.theme.spacing(6),
  color: props.theme.colors.white[200],
}));

export const ImportBeforeStartTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginTop: props.theme.spacing(5),
  textAlign: 'left',
  alignSelf: 'flex-start',
}));
export const ImportBeforeStartText = styled.p((props) => ({
  ...props.theme.body_m,
  textAlign: 'left',
  marginTop: props.theme.spacing(6),
  color: props.theme.colors.white[200],
}));

export const ImportCardContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing(6),
}));

export const SelectAssetTextContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(20),
  marginBottom: props.theme.spacing(16),
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing(6),
}));

export const SelectAssetTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
}));

export const SelectAssetText = styled.p<{
  centered?: boolean;
}>((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[200],
  textAlign: props.centered ? 'center' : 'left',
}));

export const SelectAssetFootNote = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white[200],
  marginTop: props.theme.spacing(6),
}));

export const AddAddressHeaderContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: props.theme.spacing(8),
  marginTop: props.theme.spacing(20),
  marginBottom: props.theme.spacing(8),
}));

export const CreateAnotherAccountContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: props.theme.spacing(8),
  paddingTop: props.theme.spacing(90),
  marginBottom: props.theme.spacing(16),
}));

export const AddAddressDetailsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: props.theme.spacing(20),
}));

export const AddressAddedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  text-align: center;
  gap: 8px;
  > :first-child {
    margin-bottom: 26px;
  }
`;

export const AddAccountNameContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(20),
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing(6),
}));

export const AddAccountNameTitleContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing(4),
  marginBottom: props.theme.spacing(22),
}));

export const CreateMultipleAccountsText = styled.h3((props) => ({
  ...props.theme.body_l,
  textAlign: 'center',
}));

export const EndScreenContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const EndScreenTextContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: props.theme.spacing(6),
  marginBottom: props.theme.spacing(20),
}));

export const ConfirmationText = styled.p((props) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  textAlign: 'center',
  marginTop: props.theme.spacing(50),
}));

export const ConfirmationStepsContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: props.theme.spacing(12),
}));

export const OptionsContainer = styled.div((props) => ({
  width: '100%',
  marginTop: props.theme.spacing(16),
}));

interface OptionProps {
  selected?: boolean;
}
export const Option = styled.button<OptionProps>((props) => ({
  width: '100%',
  color: props.theme.colors.white_0,
  backgroundColor: props.theme.colors.elevation3,
  padding: props.theme.spacing(8),
  paddingTop: props.theme.spacing(7),
  paddingBottom: props.theme.spacing(7),
  borderRadius: props.theme.radius(2),
  fontSize: '0.75rem',
  marginBottom: props.theme.spacing(6),
  border: `1px solid ${props.selected ? props.theme.colors.elevation6 : 'transparent'}`,
  cursor: 'pointer',
  userSelect: 'none',
  display: 'flex',
  alignItems: 'center',
  transition: 'border 0.2s ease',
}));

// TODO create radio button in ui-library
export const OptionIcon = styled.div<OptionProps>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 16,
  height: 16,
  borderRadius: '50%',
  border: `1px solid ${props.theme.colors.white[0]}`,
  marginRight: props.theme.spacing(10),
  flex: 'none',
  '&::after': {
    content: '""',
    display: props.selected ? 'block' : 'none',
    width: 10,
    height: 10,
    borderRadius: 100,
    backgroundColor: props.theme.colors.orange_main,
  },
}));

export const ConfirmationStep = styled.div<{
  isCompleted: boolean;
}>((props) => ({
  width: 32,
  height: 4,
  backgroundColor: props.isCompleted ? props.theme.colors.white[0] : props.theme.colors.white[900],
  borderRadius: props.theme.radius(1),
  transition: 'background-color 0.2s ease',
  ':first-child': {
    marginRight: props.theme.spacing(4),
  },
}));

export const TogglerContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: props.theme.spacing(18),
}));

export const TogglerText = styled.p((props) => ({
  marginLeft: props.theme.spacing(8),
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '140%',
}));

export const CustomLink = styled.a((props) => ({
  color: props.theme.colors.orange_main,
}));

export const WarningIcon = styled.img({
  width: 32,
  height: 32,
  alignSelf: 'flex-start',
});

export const LedgerFailViewContainer = styled.div((props) => ({
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  margin: 'auto',
}));

export const LedgerFailButtonsContainer = styled.div((props) => ({
  width: '100%',
  marginTop: props.theme.spacing(25),
}));

export const ActionButtonContainer = styled.div((props) => ({
  '&:not(:last-of-type)': {
    marginBottom: props.theme.spacing(8),
  },
}));
