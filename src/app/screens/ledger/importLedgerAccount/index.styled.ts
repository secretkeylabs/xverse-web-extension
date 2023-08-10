import styled from 'styled-components';
import { animated } from '@react-spring/web';
import Switch from 'react-switch';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const OnBoardingContentContainer = styled(animated.div)((props) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  flex: 1,
  justifyContent: props.className === 'center' ? 'center' : 'none',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

export const OnBoardingActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(30),
}));

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

export const ButtonContainer = styled.div((props) => ({
  marginLeft: 3,
  marginRight: 3,
  marginTop: props.theme.spacing(4),
  width: '100%',
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

export const SelectAssetText = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[200],
  textAlign: 'center',
}));

export const SelectAssetFootNote = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white[200],
  marginBottom: props.theme.spacing(25),
  marginTop: props.theme.spacing(12),
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

export const AssetSelectionButton = styled.button((props) => ({
  position: 'absolute',
  left: props.theme.spacing(105),
  top: props.theme.spacing(60),
  backgroundColor: 'transparent',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: props.theme.spacing(3),
}));

export const AssetSelectionButtonText = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[0],
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
export const Option = styled.div<OptionProps>((props) => ({
  width: '100%',
  backgroundColor: '#21253C',
  padding: props.theme.spacing(8),
  paddingTop: props.theme.spacing(7),
  paddingBottom: props.theme.spacing(7),
  borderRadius: props.theme.radius(2),
  fontSize: '0.75rem',
  marginBottom: props.theme.spacing(6),
  border: `1px solid ${props.selected ? 'rgba(115, 131, 255, 0.40)' : 'transparent'}`,
  cursor: 'pointer',
  userSelect: 'none',
  display: 'flex',
  alignItems: 'center',
  transition: 'border 0.2s ease',
}));

export const OptionIcon = styled.div<OptionProps>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 15,
  height: 15,
  borderRadius: '50%',
  border: `1px solid ${props.theme.colors.white[0]}`,
  marginRight: props.theme.spacing(10),
  flex: 'none',
  '&::after': {
    content: '""',
    display: props.selected ? 'block' : 'none',
    width: 8,
    height: 8,
    borderRadius: 100,
    backgroundColor: props.theme.colors.white[0],
  },
}));

interface ConfirmationStepProps {
  isCompleted: boolean;
}
export const ConfirmationStep = styled.div<ConfirmationStepProps>((props) => ({
  width: 32,
  height: 4,
  backgroundColor: props.isCompleted ? props.theme.colors.white[0] : props.theme.colors.white[900],
  borderRadius: props.theme.radius(1),
  transition: 'background-color 0.2s ease',
  ':first-child': {
    marginRight: props.theme.spacing(4),
  },
}));

export const CustomSwitch = styled(Switch)`
  .react-switch-handle {
    background-color: ${({ checked }) =>
      checked ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)'} !important;
    border: ${({ checked }) => (checked ? '' : '4px solid rgba(255, 255, 255, 0.2)')} !important;
  }
`;

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
