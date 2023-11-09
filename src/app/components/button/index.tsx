import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';

interface ButtonProps {
  disabled?: boolean;
  warning?: boolean;
}

const Button = styled.button<ButtonProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.warning
    ? props.theme.colors.feedback.error
    : props.theme.colors.action.classic,
  width: '100%',
  height: 44,
  transition: 'all 0.1s ease',
  columnGap: props.theme.spacing(3),
  ':disabled': {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  ':hover:enabled': {
    opacity: 0.8,
  },
  ':active:enabled': {
    opacity: 0.6,
  },
}));

const TransparentButton = styled(Button)((props) => ({
  border: `1px solid ${props.theme.colors.elevation6}`,
  backgroundColor: 'transparent',
  ':disabled': {
    cursor: 'not-allowed',
    opacity: 0.4,
  },
  ':hover:enabled': {
    backgroundColor: props.theme.colors.elevation6_800,
  },
  ':active:enabled': {
    backgroundColor: props.theme.colors.elevation6_600,
  },
}));

interface TextProps {
  warning?: boolean;
}

const ButtonText = styled.h1<TextProps>((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  color: `${props.warning ? props.theme.colors.white_0 : props.theme.colors.elevation0}`,
  textAlign: 'center',
}));

const AnimatedButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

const ButtonImage = styled.img({
  alignSelf: 'center',
  transform: 'all',
});

const ButtonIconContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

interface Props {
  className?: string;
  src?: string;
  icon?: JSX.Element;
  iconPosition?: 'left' | 'right';
  text: string;
  onPress: (e: React.MouseEvent) => void;
  processing?: boolean;
  disabled?: boolean;
  transparent?: boolean;
  warning?: boolean;
  hoverDialogId?: string;
}

function ActionButton({
  className,
  src,
  icon,
  iconPosition = 'left',
  text,
  onPress,
  processing = false,
  disabled = false,
  transparent,
  warning,
  hoverDialogId,
}: Props) {
  const handleOnPress = (e: React.MouseEvent) => {
    if (!disabled) {
      onPress(e);
    }
  };

  if (transparent) {
    return (
      <TransparentButton
        id={hoverDialogId}
        className={className}
        onClick={handleOnPress}
        disabled={disabled || processing}
      >
        {processing ? (
          <MoonLoader color="white" size={10} />
        ) : (
          <>
            {src && <ButtonImage src={src} />}
            {icon && iconPosition === 'left' && <ButtonIconContainer>{icon}</ButtonIconContainer>}
            <AnimatedButtonText>{text}</AnimatedButtonText>
            {icon && iconPosition === 'right' && <ButtonIconContainer>{icon}</ButtonIconContainer>}
          </>
        )}
      </TransparentButton>
    );
  }

  return (
    <Button
      className={className}
      onClick={handleOnPress}
      disabled={disabled || processing}
      warning={warning}
    >
      {processing ? (
        <MoonLoader color="#12151E" size={12} />
      ) : (
        <>
          {src && <ButtonImage src={src} />}
          {icon && iconPosition === 'left' && <ButtonIconContainer>{icon}</ButtonIconContainer>}
          <ButtonText warning={warning}>{text}</ButtonText>
          {icon && iconPosition === 'right' && <ButtonIconContainer>{icon}</ButtonIconContainer>}
        </>
      )}
    </Button>
  );
}
export default ActionButton;
