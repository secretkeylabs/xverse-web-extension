import { XCircle } from '@phosphor-icons/react';
import { isInOptions } from '@utils/helper';
import Modal from 'react-modal';
import styled, { useTheme } from 'styled-components';

const BottomModalTitleText = styled.h1((props) => ({
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

const ButtonImage = styled.button({
  backgroundColor: 'transparent',
});

const CustomisedModal = styled(Modal)`
  overflow-y: auto;
  position: absolute;
`;

const BodyContainer = styled.div`
  margin: ${(props) => props.theme.space.m};
`;

type Props = {
  title: string;
  visible: boolean;
  children: React.ReactNode;
  onClose: () => void;
  overlayStylesOverriding?: {};
  contentStylesOverriding?: {};
  className?: string;
};

function Sheet({
  title,
  children,
  visible,
  onClose,
  overlayStylesOverriding,
  contentStylesOverriding,
  className,
}: Props) {
  const theme = useTheme();
  const isGalleryOpen = isInOptions();

  const customStyles = {
    overlay: {
      backgroundColor: theme.colors.background.modalBackdrop,
      zIndex: 15000,
      ...overlayStylesOverriding,
    },
    content: {
      bottom: isGalleryOpen ? '50%' : '0',
      left: isGalleryOpen ? '50%' : undefined,
      transform: isGalleryOpen ? 'translateX(-50%) translateY(50%)' : undefined,
      width: '100vw',
      maxWidth: isGalleryOpen ? 330 : 360,
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
    >
      <RowContainer>
        <BottomModalTitleText>{title}</BottomModalTitleText>
        <ButtonImage onClick={onClose}>
          <XCircle color={theme.colors.white_200} weight="fill" size="28" />
        </ButtonImage>
      </RowContainer>
      <BodyContainer>{children}</BodyContainer>
    </CustomisedModal>
  );
}

export default Sheet;
