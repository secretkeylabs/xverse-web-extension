import { ReactNode } from 'react';
import styled from 'styled-components';
import { MoonLoader } from 'react-spinners';

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
};

function ConfirmScreen({
  children, onConfirm, onCancel, confirmText, cancelText, loading,
}: Props) {
  return (
    <>
      <MainContainer>
        <ContentContainer>
          {children}
        </ContentContainer>
      </MainContainer>
      <ButtonsContainer>
        <CancelButton onClick={onCancel}>{cancelText}</CancelButton>
        <ConfirmButton onClick={onConfirm}>
          {loading ? <MoonLoader color="white" size={20} /> : confirmText}
        </ConfirmButton>
      </ButtonsContainer>
    </>
  );
}

export default ConfirmScreen;
