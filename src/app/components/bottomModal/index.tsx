import Modal from 'react-modal';
import styled from 'styled-components';
import Theme from 'theme';
import Cross from '@assets/img/dashboard/X.svg';
import Seperator from '@components/seperator';

const customStyles = {
  overlay: {
    backgroundColor: Theme.colors.background.modalBackdrop,
  },
  content: {
    inset: 'auto auto 0px auto',
    width: '100%',
    maxHeight: '90%',
    border: 'transparent',
    background: Theme.colors.background.elevation2,
    margin: 0,
    padding: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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

const ButtonImage = styled.img({
  alignSelf: 'center',
  transform: 'all',
});

interface Props {
  header: string;
  visible: boolean;
  children: React.ReactNode;
  onClose: () => void;
}

function BottomModal({ header, children, visible, onClose }: Props) {
  return (
    <Modal
      isOpen={visible}
      parentSelector={() => {
        const parent = (document.querySelector('#app') as HTMLElement) ?? document.body;
        return parent;
      }}
      ariaHideApp={false}
      style={customStyles}
      contentLabel="Example Modal"
    >
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
