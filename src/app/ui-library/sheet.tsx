import { XCircle } from '@phosphor-icons/react';
import { isInOptions } from '@utils/helper';
import Modal from 'react-modal';
import styled, { useTheme } from 'styled-components';

export const CrossButton = styled.button`
  background-color: transparent;
  cursor: pointer;
  display: flex;
  transition: opacity 0.1s ease;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }
`;

const Title = styled.h1((props) => ({
  ...props.theme.typography.body_bold_l,
  flex: 1,
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: props.theme.space.m,
}));

const CustomisedModal = styled(Modal)`
  overflow-y: auto;
  position: absolute;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const BodyContainer = styled.div`
  margin: ${(props) => props.theme.space.m};
`;

type Props = {
  title: string;
  visible: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  overlayStylesOverriding?: {};
  contentStylesOverriding?: {};
  className?: string;
  shouldCloseOnOverlayClick?: boolean;
};

function Sheet({
  title,
  children,
  visible,
  onClose,
  overlayStylesOverriding,
  contentStylesOverriding,
  className,
  shouldCloseOnOverlayClick = true,
}: Props) {
  const theme = useTheme();
  const isGalleryOpen = isInOptions();

  const customStyles = {
    overlay: {
      backgroundColor: theme.colors.background.modalBackdrop,
      zIndex: 15000,
      display: 'flex',
      alignItems: isGalleryOpen ? 'center' : 'flex-end',
      justifyContent: 'center',
      ...overlayStylesOverriding,
    },
    content: {
      width: '100vw',
      maxWidth: 360,
      maxHeight: '90vh',
      border: 'transparent',
      background: theme.colors.elevation6_600,
      backdropFilter: 'blur(24px)',
      margin: 0,
      padding: 0,
      borderTopLeftRadius: isGalleryOpen ? 12 : 20,
      borderTopRightRadius: isGalleryOpen ? 12 : 20,
      borderBottomRightRadius: isGalleryOpen ? 12 : 0,
      borderBottomLeftRadius: isGalleryOpen ? 12 : 0,
      boxShadow: isGalleryOpen ? `0px 0px 20px ${theme.colors.elevation_n1}` : undefined,
      ...contentStylesOverriding,
    },
  };

  return (
    <CustomisedModal
      isOpen={visible}
      parentSelector={() => document.getElementById('app') as HTMLElement}
      ariaHideApp={false}
      style={customStyles}
      className={className}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      onRequestClose={onClose}
    >
      <RowContainer>
        <Title>{title}</Title>
        {onClose && (
          <CrossButton onClick={onClose}>
            <XCircle color={theme.colors.white_200} weight="fill" size="28" />
          </CrossButton>
        )}
      </RowContainer>
      <BodyContainer>{children}</BodyContainer>
    </CustomisedModal>
  );
}

export default Sheet;
