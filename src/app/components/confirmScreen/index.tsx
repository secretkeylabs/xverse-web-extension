import Button from '@ui-library/button';
import type { ReactNode } from 'react';
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

const ConfirmButtonContainer = styled.div((props) => ({
  width: '100%',
  marginLeft: props.theme.spacing(3),
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
      <MainContainer>{children}</MainContainer>
      <ButtonsContainer>
        <Button onClick={onCancel} title={cancelText} variant="secondary" />
        <ConfirmButtonContainer>
          <Button
            onClick={onConfirm}
            disabled={disabled}
            loading={loading}
            title={confirmText}
            variant={isError ? 'danger' : 'primary'}
          />
        </ConfirmButtonContainer>
      </ButtonsContainer>
    </>
  );
}

export default ConfirmScreen;
