import { XCircle } from '@phosphor-icons/react';
import styled, { useTheme } from 'styled-components';
import Theme from 'theme';

const Button = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
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

type Props = {
  onClick: () => void;
  size?: keyof typeof Theme.space;
  className?: string;
};

function CrossButton({ onClick, size = 'l', className }: Props) {
  const theme = useTheme();

  const internalOnClick = (e) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <Button onClick={internalOnClick} className={className}>
      <XCircle color={theme.colors.white_200} weight="fill" size={Theme.space[size]} />
    </Button>
  );
}

export default CrossButton;
