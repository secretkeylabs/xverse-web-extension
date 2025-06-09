import Modal from 'react-modal';
import styled, { useTheme } from 'styled-components';
import Button from './button';
import { CrossButtonInline } from './crossButton';

type DialogType = 'default' | 'feedback';

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

const HeaderText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_l,
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const CenteredTitle = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  textAlign: 'center',
  marginTop: props.theme.space.s,
}));

const DescriptionText = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.space.m,
}));

const DescriptionTextCenter = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.space.xxs,
  textAlign: 'center',
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'space-between',
});

const ButtonsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: props.theme.space.xl,
  gap: props.theme.space.s,
}));

const Column = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.space.m,
  alignItems: 'center',
}));

const CustomCrossButton = styled(CrossButtonInline)({
  top: 'initial',
  right: 'initial',
});

type Props = {
  onClose: () => void;
  title: string;
  description: string;
  leftButtonText?: string;
  leftButtonDisabled?: boolean;
  rightButtonText?: string;
  rightButtonDisabled?: boolean;
  type?: DialogType;
  icon?: JSX.Element;
  onLeftButtonClick?: () => void;
  onRightButtonClick?: () => void;
  overlayStylesOverriding?: {};
  contentStylesOverriding?: {};
  shouldCloseOnOverlayClick?: boolean;
  visible: boolean;
  className?: string;
};

// TODO: handle horizontal and vertical buttons view

function Dialog({
  onClose,
  title,
  description,
  leftButtonText,
  leftButtonDisabled,
  rightButtonText,
  rightButtonDisabled,
  type = 'default',
  icon,
  onLeftButtonClick,
  onRightButtonClick,
  overlayStylesOverriding,
  contentStylesOverriding,
  shouldCloseOnOverlayClick = true,
  visible,
  className,
}: Props) {
  const theme = useTheme();

  const customStyles = {
    overlay: {
      backgroundColor: `rgba(24, 24, 24, 0.8)`,
      zIndex: 15000,
      ...overlayStylesOverriding,
    },
    content: {
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: 312,
      borderRadius: 16,
      padding: theme.space.m,
      paddingBottom: theme.space.xl,
      backgroundColor: theme.colors.elevation2,
      backdropFilter: 'blur(12px)',
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
      <RowContainer>
        <HeaderText>
          {type === 'default' ? title : ''}
          <CustomCrossButton onClick={onClose} />
        </HeaderText>
      </RowContainer>
      {type === 'default' ? (
        <DescriptionText>{description}</DescriptionText>
      ) : (
        <Column>
          {icon}
          <CenteredTitle>{title}</CenteredTitle>
          <DescriptionTextCenter>{description}</DescriptionTextCenter>
        </Column>
      )}
      {onRightButtonClick && onLeftButtonClick && (
        <ButtonsContainer>
          <Button
            title={leftButtonText ?? 'No'}
            variant="secondary"
            onClick={onLeftButtonClick}
            disabled={leftButtonDisabled}
          />
          <Button
            title={rightButtonText ?? 'Yes'}
            onClick={onRightButtonClick}
            disabled={rightButtonDisabled}
          />
        </ButtonsContainer>
      )}
      {!onRightButtonClick && onLeftButtonClick && (
        <ButtonsContainer>
          <Button
            title={leftButtonText ?? 'Yes'}
            onClick={onLeftButtonClick}
            disabled={leftButtonDisabled}
          />
        </ButtonsContainer>
      )}
    </CustomisedModal>
  );
}

export default Dialog;
