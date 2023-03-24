import styled from 'styled-components';

const Icon = styled.img((props) => ({
  marginRight: props.theme.spacing(8),
  width: 32,
  height: 32,
  borderRadius: 30,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  color: props.theme.colors.white[0],
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[400],
}));

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

const RowContainer = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: 8,
  border: `1px solid ${props.theme.colors.background.elevation3}`,
  padding: 16,
  background: 'transparent',
  width: '100%',
  marginBottom: 12,
}));

interface Props {
  image: string;
  title: string;
  description: string;
  onClick: () => void;
}

function FundsRow({
  image, title, description, onClick,
}: Props) {
  return (
    <RowContainer onClick={onClick}>
      <Icon src={image} />
      <Container>
        <TitleText>{title}</TitleText>
        <ValueText>{description}</ValueText>
      </Container>
    </RowContainer>

  );
}

export default FundsRow;
