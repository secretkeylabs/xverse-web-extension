import { animated } from '@react-spring/web';
import styled from 'styled-components';

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

export const SelectAssetTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
}));

export const SelectAssetText = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_200,
  textAlign: 'center',
}));

export const AddAddressHeaderContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: props.theme.spacing(8),
  marginTop: props.theme.spacing(20),
  marginBottom: props.theme.spacing(8),
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

export const CopyContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: 328,
  justifyContent: 'center',
  marginTop: props.theme.spacing(11),
}));

export const QRCodeContainer = styled.div((props) => ({
  display: 'flex',
  aspectRatio: 1,
  backgroundColor: props.theme.colors.white_0,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  padding: props.theme.spacing(5),
  marginBottom: props.theme.spacing(12),
}));

export const InfoAlertContainer = styled.div({
  width: '100%',
});

export const ActionButtonsContainer = styled.div({
  width: '100%',
});

export const ActionButtonContainer = styled.div((props) => ({
  '&:not(:last-of-type)': {
    marginBottom: props.theme.spacing(8),
  },
}));

export const LedgerFailViewContainer = styled.div((props) => ({
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  margin: 'auto',
}));

export const LedgerFailButtonsContainer = styled.div((props) => ({
  width: '100%',
  marginTop: props.theme.spacing(25),
}));
