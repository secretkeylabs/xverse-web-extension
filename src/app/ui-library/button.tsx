import styled from 'styled-components';
import Theme from 'theme';
import Spinner from './spinner';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';

const ButtonContainer = styled.div<{
  $variant: ButtonVariant;
  $disabled: boolean;
  $loading: boolean;
}>`
  user-select: none;

  display: flex;
  justify-content: center;
  gap: 8px;

  padding: ${(props) => props.theme.spacing(6)}px ${(props) => props.theme.spacing(8)}px;
  border-radius: 12px;

  ${(props) => props.theme.typography.body_m}

  cursor: ${(props) => (props.$disabled || props.$loading ? 'not-allowed' : 'pointer')};

  ${(props) => {
    if (props.$disabled || props.$loading) {
      switch (props.$variant) {
        case 'primary':
          return `
            background-color: ${props.theme.colors.white_600};
            color: ${props.theme.colors.elevation0};
          `;
        case 'secondary':
          return `
            border: 1px solid ${props.theme.colors.white_900};
            color: ${props.theme.colors.white_400};
          `;
        case 'tertiary':
          return `
            color: ${props.theme.colors.white_400};
          `;
        case 'danger':
          return `
            background-color: ${props.theme.colors.danger_dark_400};
            color: ${props.theme.colors.white_400};
          `;
        default:
          return '';
      }
    }

    switch (props.$variant) {
      case 'primary':
        return `
          background-color: ${props.theme.colors.white_0};
          color: ${props.theme.colors.elevation0};
        `;
      case 'secondary':
        return `
          border: 1px solid ${props.theme.colors.white_800};
          color: ${props.theme.colors.white};
        `;
      case 'tertiary':
        return `
          color: ${props.theme.colors.white};
        `;
      case 'danger':
        return `
          background-color: ${props.theme.colors.danger_dark};
          color: ${props.theme.colors.white};
        `;
      default:
        return '';
    }
  }}

  &:focus, &:hover {
    ${(props) => {
      if (props.$disabled) return '';

      switch (props.$variant) {
        case 'primary':
          return `
            background-color: ${props.theme.colors.white_200};
          `;
        case 'secondary':
          return `
            border: 1px solid ${props.theme.colors.white_850};
            background-color: ${props.theme.colors.elevation6_800};
          `;
        case 'tertiary':
          return `
            color: ${props.theme.colors.white_200};
          `;
        case 'danger':
          return `
            background-color: ${props.theme.colors.danger_dark_100};
          `;
        default:
          return '';
      }
    }}
  }

  &:active {
    ${(props) => {
      if (props.$disabled) return '';

      switch (props.$variant) {
        case 'primary':
          return `
            background-color: ${props.theme.colors.white_400};
          `;
        case 'secondary':
          return `
            border: 1px solid ${props.theme.colors.white};
            background-color: ${props.theme.colors.elevation6_600};
          `;
        case 'tertiary':
          return `
            color: ${props.theme.colors.white_400};
          `;
        case 'danger':
          return `
            background-color: ${props.theme.colors.danger_dark_200};
          `;
        default:
          return '';
      }
    }}
  }
`;

type Props = {
  title: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  variant?: ButtonVariant;
};

function Button({
  title,
  onClick,
  icon,
  className,
  loading = false,
  disabled = false,
  variant = 'primary',
}: Props) {
  const handleClick = () => {
    if (!disabled && !loading) {
      onClick();
    }
  };

  const onKeyPressHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleClick();
    }
  };

  const spinnerColor =
    variant === 'primary'
      ? Theme.colors.elevation_n1
      : variant === 'secondary'
      ? Theme.colors.white_0
      : variant === 'tertiary'
      ? Theme.colors.white_0
      : variant === 'danger'
      ? Theme.colors.white_200
      : Theme.colors.elevation_n1;

  return (
    <ButtonContainer
      className={className}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={onKeyPressHandler}
      $variant={variant}
      $disabled={disabled}
      $loading={loading}
    >
      {loading ? (
        <Spinner color={spinnerColor} />
      ) : (
        <>
          <div>{icon}</div>
          <div>{title}</div>
        </>
      )}
    </ButtonContainer>
  );
}

export default Button;
