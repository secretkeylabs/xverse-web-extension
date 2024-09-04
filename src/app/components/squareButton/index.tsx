import styled from 'styled-components';

const Button = styled.button<{ $isTransparent?: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: '16px',
  rowGap: '8px',
  backgroundColor: 'transparent',
  ':hover > div': {
    backgroundColor: props.$isTransparent
      ? props.theme.colors.background.elevation6_800
      : props.theme.colors.action.classicLight,
    opacity: 0.6,
  },
}));

const Icon = styled.img`
  width: 20px;
  height: 20px;
`;

const Wrapper = styled.div<{
  $isTransparent?: boolean;
}>((props) => ({
  display: 'flex',
  width: 48,
  height: 48,
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'background-color 0.2s ease, opacity 0.2s ease',
  borderRadius: 'inherit',
  backgroundColor: props.$isTransparent ? 'transparent' : props.theme.colors.action.classic,
  border: `1px solid ${
    props.$isTransparent ? props.theme.colors.white_800 : props.theme.colors.action.classic
  }`,
}));

const Title = styled.span((props) => ({
  ...props.theme.typography.body_medium_s,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

const IconContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

type Props = {
  text: string;
  onPress: () => void;
  src?: string;
  icon?: JSX.Element;
  isTransparent?: boolean;
  hoverDialogId?: string;
};

function SquareButton({ src, text, icon, onPress, isTransparent, hoverDialogId }: Props) {
  return (
    <Button onClick={onPress} $isTransparent={isTransparent}>
      <Wrapper id={hoverDialogId} $isTransparent={isTransparent}>
        {src && <Icon src={src} alt={text} />}
        {icon && <IconContainer>{icon}</IconContainer>}
      </Wrapper>
      <Title>{text}</Title>
    </Button>
  );
}

export default SquareButton;
