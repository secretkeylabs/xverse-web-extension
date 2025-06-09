import { XCircle } from '@phosphor-icons/react';
import styled from 'styled-components';
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
  color?: string;
  size?: keyof typeof Theme.space;
  className?: string;
  ariaLabel?: string;
};

function CrossButton({
  onClick,
  size = 'l',
  className,
  color = Theme.colors.white_200,
  ariaLabel,
}: Props) {
  const internalOnClick = (e) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <Button onClick={internalOnClick} className={className} aria-label={ariaLabel}>
      <XCircle color={color} weight="fill" size={Theme.space[size]} />
    </Button>
  );
}

export default CrossButton;

export const CrossButtonInline = styled(CrossButton)<{ $marginBottom?: string }>((props) => ({
  position: 'relative',
  marginBottom: props.$marginBottom ? props.$marginBottom : 0,
  top: 'initial',
  right: 'initial',
}));
