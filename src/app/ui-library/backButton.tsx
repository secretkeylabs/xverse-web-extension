import { ArrowLeft } from '@phosphor-icons/react';
import styled from 'styled-components';
import Theme from 'theme';

const StyledButton = styled.button((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
  padding: 5,
  borderRadius: 50,
  width: 30,
  height: 30,
  transition: 'background-color 0.1s ease',
  '&:hover': {
    backgroundColor: props.theme.colors.white_900,
  },
}));

function BackButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <StyledButton {...props}>
      <ArrowLeft size={20} color={Theme.colors.white_0} alt="back button" />
    </StyledButton>
  );
}

export default BackButton;
