import Cross from '@assets/img/dashboard/X.svg';
import Separator from '@components/separator';
import Modal from 'react-modal';
import styled, { useTheme } from 'styled-components';

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
  overlayStylesOverriding?: {};
  contentStylesOverriding?: {};
}

const CustomisedModal = styled(Modal)`
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  position: absolute;
`;

function BottomModal({
  header,
  children,
  visible,
  onClose,
  overlayStylesOverriding,
  contentStylesOverriding,
}: Props) {
  const theme = useTheme();
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const customStyles = {
    overlay: {
      backgroundColor: isGalleryOpen ? 'transparent' : theme.colors.background.modalBackdrop,
      height: '100%',
      width: 360,
      margin: 'auto',
      zIndex: 15000,
      ...overlayStylesOverriding,
    },
    content: {
      inset: 'auto auto 0px auto',
      width: '100%',
      maxWidth: 360,
      maxHeight: '90%',
      border: 'transparent',
      background: theme.colors.elevation2,
      margin: 0,
      padding: 0,
      borderTopLeftRadius: isGalleryOpen ? 12 : 20,
      borderTopRightRadius: isGalleryOpen ? 12 : 20,
      borderBottomRightRadius: isGalleryOpen ? 12 : 0,
      borderBottomLeftRadius: isGalleryOpen ? 12 : 0,
      ...contentStylesOverriding,
    },
  };

  return (
    <CustomisedModal
      isOpen={visible}
      parentSelector={() => document.getElementById('app') as HTMLElement}
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
      {header && <Separator />}
      {children}
    </CustomisedModal>
  );
}

export default BottomModal;
