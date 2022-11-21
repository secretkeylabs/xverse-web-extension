import Modal from 'react-modal';
import styled, { useTheme } from 'styled-components';
import Cross from '@assets/img/dashboard/X.svg';
import Seperator from '@components/seperator';

const BottomModalHeaderText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  flex: 1,
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'space-between',
  marginLeft: props.theme.spacing(12),
  marginRight: props.theme.spacing(12),
  marginTop: props.theme.spacing(12),
}));

const ButtonImage = styled.button({
  backgroundColor: 'transparent',
});

interface Props {
  header: string;
  visible: boolean;
  children: React.ReactNode;
  onClose: () => void;
}

const CustomisedModal = styled(Modal)`
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  bottom: 0;
  position: absolute;
`;

function BottomModal({
  header, children, visible, onClose,
}: Props) {
  const theme = useTheme();
  const customStyles = {
    overlay: {
      backgroundColor: theme.colors.background.modalBackdrop,
    },
    content: {
      inset: 'auto auto 0px auto',
      width: '100%',
      maxHeight: '90%',
      border: 'transparent',
      background: theme.colors.background.elevation2,
      margin: 0,
      padding: 0,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
  };

  return (
    <CustomisedModal
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
        <ButtonImage onClick={onClose}>
          <img src={Cross} alt="cross" />
        </ButtonImage>
      </RowContainer>
      <Seperator />

      {children}
    </CustomisedModal>
  );
}

export default BottomModal;
