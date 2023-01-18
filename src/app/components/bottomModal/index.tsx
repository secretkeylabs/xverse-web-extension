import Modal from 'react-modal';
import styled, { useTheme } from 'styled-components';
import Cross from '@assets/img/dashboard/X.svg';
import Seperator from '@components/seperator';

const BottomModalHeaderText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  flex: 1,
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'space-between',
  margin: '24px 24px 20px 24px',
});

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
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const customStyles = {
    overlay: {
      backgroundColor: isGalleryOpen ? 'transparent' : theme.colors.background.modalBackdrop,
      height: '100%',
      width: 360,
      margin: 'auto',
    },
    content: {
      inset: 'auto auto 0px auto',
      width: '100%',
      maxWidth: 360,
      maxHeight: '90%',
      border: 'transparent',
      background: theme.colors.background.elevation2,
      margin: 0,
      padding: 0,

      borderTopLeftRadius: isGalleryOpen ? 12 : 20,
      borderTopRightRadius: isGalleryOpen ? 12 : 20,
      borderBottomRightRadius: isGalleryOpen ? 12 : 0,
      borderBottomLeftRadius: isGalleryOpen ? 12 : 0,
    },
  };

  return (
    <CustomisedModal
      isOpen={visible}
      parentSelector={() => (document.getElementById('app') as HTMLElement)}
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
