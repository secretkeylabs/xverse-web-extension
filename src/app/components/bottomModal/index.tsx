import { useState } from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';
import Theme from 'theme';
import Cross from '@assets/img/dashboard/X.svg';

const customStyles = {
  overlay: {
    backgroundColor: Theme.colors.background.modalBackdrop,
  },
  content: {
    position: 'fixed',
    top: '50%',
    height: '50%',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    border: 'transparent',
    background: Theme.colors.background.elevation2,
    margin: 0,
    padding: 0,
    borderRadius: 16,
  },
};

const BottomModalHeaderText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  flex: 1,
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'space-between',
  margin: props.theme.spacing(12),
}));

const ButtonImage = styled.img((props) => ({
  alignSelf: 'center',
  transform: 'all',
}));

const Seperator = styled.div((props) => ({
  width: '100%',
  height: 0,
  border: `1px solid ${props.theme.colors.background.elevation3}`,
  marginTop: props.theme.spacing(8),
}));

interface Props {
  header: string;
  visible: boolean;
  children: React.ReactNode;
  onClose: () => void;
}

function BottomModal({ header, children, visible ,onClose}: Props) {
  const [modalIsOpen, setIsOpen] = useState(visible);

  function closeModal() {
    setIsOpen(false);
  }
  return (
    <Modal isOpen={visible} backdropOpacity={1} ariaHideApp={false} style={customStyles} contentLabel="Example Modal">
      <RowContainer>
        <BottomModalHeaderText>{header}</BottomModalHeaderText>
        <ButtonImage src={Cross} onClick={onClose} />
      </RowContainer>
      <Seperator />

      {children}
    </Modal>
  );
}

export default BottomModal;
