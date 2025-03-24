import { isInOptions } from '@utils/helper';
import Modal from 'react-modal';
import styled, { useTheme } from 'styled-components';
import CrossButton from './crossButton';

const Title = styled.h1((props) => ({
  ...props.theme.typography.body_bold_l,
  flex: 1,
  width: '100%',
}));

const HeaderContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: props.theme.space.m,
  gap: props.theme.space.m,
  minHeight: props.theme.space.l,
}));

const CustomisedModal = styled(Modal)`
  position: absolute;
  max-height: 100%;
  display: flex;
  flex-direction: column;

  &:focus-visible::after {
    border: none;
    outline: none;
  }
`;

const BodyContainer = styled.div`
  position: relative;
  flex: 1;
  margin: ${(props) => `0 0 ${props.theme.space.m} ${props.theme.space.m}`};
  padding-right: ${(props) => props.theme.space.m};
  scrollbar: ${(props) => props.theme.scrollbar};
  scrollbar-gutter: stable;
`;

type Props = {
  title?: string;
  visible: boolean;
  logo?: React.ReactNode;
  children: React.ReactNode;
  onClose?: () => void;
  overlayStylesOverriding?: {};
  contentStylesOverriding?: {};
  className?: string;
  shouldCloseOnOverlayClick?: boolean;
};

function Sheet({
  title,
  logo,
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
      zIndex: 100,
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
      closeTimeoutMS={200}
      appElement={document.getElementById('app') as HTMLElement}
      ariaHideApp={false}
      style={customStyles}
      className={className}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      onRequestClose={onClose}
    >
      {onClose && <CrossButton onClick={onClose} />}
      <HeaderContainer>
        {logo}
        <Title>{title}</Title>
      </HeaderContainer>
      <BodyContainer>{children}</BodyContainer>
    </CustomisedModal>
  );
}

export default Sheet;
