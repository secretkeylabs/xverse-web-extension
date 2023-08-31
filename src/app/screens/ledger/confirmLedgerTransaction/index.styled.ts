import styled from 'styled-components';
import { animated } from '@react-spring/web';

export const Container = styled.div`
  display: flex;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  flex-direction: column;
  flex: 1;
  &::-webkit-scrollbar {
    display: none;
  }
`;
export const OnBoardingContentContainer = styled(animated.div)((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'center',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

export const SuccessActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing(6),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(30),
}));

export const TxConfirmedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  > :first-child {
    margin-bottom: 26px;
  }
`;
export const TxConfirmedTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
}));

export const TxConfirmedDescription = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[200],
}));

export const InfoImage = styled.img({
  width: 64,
  height: 64,
});

export const ConnectLedgerTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginBottom: props.theme.spacing(6),
}));

interface ConnectLedgerTextAdvancedProps {
  isCompleted?: boolean;
}
export const ConnectLedgerTextAdvanced = styled.p<ConnectLedgerTextAdvancedProps>((props) => ({
  ...props.theme.body_m,
  display: 'flex',
  alignItems: 'flex-start',
  color: props.isCompleted ? props.theme.colors.white[400] : props.theme.colors.white[200],
  textAlign: 'center',
  marginBottom: props.theme.spacing(16),
}));

export const InfoContainerWrapper = styled.div((props) => ({
  textAlign: 'left',
  marginTop: props.theme.spacing(8),
}));

export const TxDetails = styled.div((props) => ({
  marginTop: props.theme.spacing(36),
  width: '100%',
  fontSize: '0.875rem',
  fontWeight: 500,
}));

export const TxDetailsRow = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: props.theme.spacing(6),
}));

export const TxDetailsTitle = styled.div((props) => ({
  color: props.theme.colors.white[200],
}));

export const RecipientsWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

export const ConfirmTxIconBig = styled.img((props) => ({
  width: 32,
  height: 32,
  marginBottom: props.theme.spacing(8),
}));
