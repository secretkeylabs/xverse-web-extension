import { XCircle } from '@phosphor-icons/react';
import { POPUP_WIDTH } from '@utils/constants';
import Modal from 'react-modal';
import styled, { useTheme } from 'styled-components';

const BottomModalHeaderText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_l,
  flex: 1,
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: props.theme.space.m,
  marginBottom: 0,
}));

const ButtonImage = styled.button({
  backgroundColor: 'transparent',
});

const CustomisedModal = styled(Modal)`
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  position: absolute;
`;

type Props = {
  header: string;
  visible: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  overlayStylesOverriding?: {};
  contentStylesOverriding?: {};
  className?: string;
};

function BottomModal({
  header,
  children,
  visible,
  onClose,
  overlayStylesOverriding,
  contentStylesOverriding,
  className,
}: Props) {
  const theme = useTheme();
  const isGalleryOpen: boolean = document.documentElement.clientWidth > POPUP_WIDTH;
  const customStyles = {
    overlay: {
      backgroundColor: isGalleryOpen ? 'transparent' : theme.colors.background.modalBackdrop,
      height: '100%',
      width: POPUP_WIDTH,
      margin: 'auto',
      zIndex: 15000,
      ...overlayStylesOverriding,
    },
    content: {
      inset: 'auto auto 0px auto',
      width: '100%',
      maxWidth: POPUP_WIDTH,
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
      className={className}
    >
      <RowContainer>
        <BottomModalHeaderText>{header}</BottomModalHeaderText>
        {onClose && (
          <ButtonImage onClick={onClose}>
            <XCircle color={theme.colors.white_200} weight="fill" size="28" />
          </ButtonImage>
        )}
      </RowContainer>
      {children}
    </CustomisedModal>
  );
}

/**
 * @deprecated use @ui-library/sheet
 */
export default BottomModal;
