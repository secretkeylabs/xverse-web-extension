import { ReactNode } from 'react';
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ContentContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const ButtonsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: props.theme.spacing(20),
  marginTop: props.theme.spacing(12),
  marginLeft: 16,
  marginRight: 16,
}));

const ConfirmButton = styled.button<{ isError: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.isError
    ? props.theme.colors.feedback.error
    : props.theme.colors.action.classic,
  color: props.isError ? props.theme.colors.white[200] : props.theme.colors.background.elevation0,
  width: '50%',
  height: 44,
  marginLeft: 6,
  ':disabled': {
    opacity: 0.6,
    cursor: 'initial',
  },
}));

const CancelButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.background.elevation0,
  border: `1px solid ${props.theme.colors.background.elevation2}`,
  color: props.theme.colors.white['0'],
  width: '50%',
  height: 44,
  marginRight: 6,
}));

type Props = {
  children: ReactNode;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  disabled?: boolean;
  isError?: boolean;
};

function ConfirmScreen({
  children,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  loading,
  disabled = false,
  isError = false,
}: Props) {
  return (
    <>
      <MainContainer>
        <ContentContainer>{children}</ContentContainer>
      </MainContainer>
      <ButtonsContainer>
        <CancelButton onClick={onCancel}>{cancelText}</CancelButton>
        <ConfirmButton onClick={onConfirm} disabled={disabled} isError={isError}>
          {loading ? <MoonLoader color="black" size={20} /> : confirmText}
        </ConfirmButton>
      </ButtonsContainer>
    </>
  );
}

export default ConfirmScreen;
