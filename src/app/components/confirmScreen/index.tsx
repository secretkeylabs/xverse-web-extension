import { ReactElement } from 'react';
import styled from 'styled-components';

const MainContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
}));

const ControlsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  width: '100%',
  marginTop: 'auto',
}));

const ButtonsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: props.theme.spacing(20),
  marginTop: 43,
  marginLeft: 16,
  marginRight: 16,
}));

const ConfirmButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.action.classic,
  color: props.theme.colors.white['0'],
  width: '50%',
  height: 44,
  marginLeft: 6,
}));

const CancelButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.background.elevation0,
  border: '1px solid #272A44',
  color: props.theme.colors.white['0'],
  width: '50%',
  height: 44,
  marginRight: 6,
}));

type Props = {
  children: ReactElement;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmScreen({ children, onConfirm, onCancel, confirmText, cancelText }: Props) {
  return (
    <MainContainer>
      {children}
      <ControlsContainer>
        <ButtonsContainer>
          <CancelButton onClick={onCancel}>{cancelText}</CancelButton>
          <ConfirmButton onClick={onConfirm}>{confirmText}</ConfirmButton>
        </ButtonsContainer>
      </ControlsContainer>
    </MainContainer>
  );
}

export default ConfirmScreen;
