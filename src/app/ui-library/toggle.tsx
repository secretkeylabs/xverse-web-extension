import styled from 'styled-components';

const Container = styled.div`
  display: inline-block;
  position: relative;
`;

const Input = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${(props) => props.theme.colors.elevation3};
  transition: 0.4s;
  border-radius: inherit;

  &::before {
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: ${(props) => props.theme.colors.white_600};
    border-radius: 50%;
    filter: drop-shadow(0px 1px 6px rgba(0, 0, 0, 0.15));
    transition: 0.4s;
  }

  &::after {
    position: absolute;
    content: '';
    height: 8px;
    width: 8px;
    left: 8px;
    bottom: 8px;
    border-radius: 50%;
    background-color: inherit;
    transition: transform 0.4s, background-color 0.1s;
  }
`;

const Label = styled.label`
  display: block;
  width: 40px;
  height: 24px;
  position: relative;
  background-color: transparent;
  border-radius: 24px;

  ${Input}:checked + ${Slider} {
    background-color: ${(props) => props.theme.colors.tangerine};
  }

  ${Input}:checked + ${Slider}::before,
  ${Input}:checked + ${Slider}::after {
    transform: translateX(16px);
    background-color: ${(props) => props.theme.colors.white_0};
  }
`;

type Props = {
  className?: string;
  checked: boolean;
  onChange: (newValue: boolean) => void;
  disabled?: boolean;
};

function Toggle({ className, checked, onChange, disabled }: Props) {
  const handleToggle = () => {
    onChange(!checked);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLabelElement>) => {
    if (!disabled && event.key === ' ') {
      event.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <Container className={className}>
      <Label
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        role="checkbox"
        aria-checked={checked}
      >
        <Input disabled={disabled} type="checkbox" checked={checked} onChange={handleToggle} />
        <Slider />
      </Label>
    </Container>
  );
}

export default Toggle;
