import styled from 'styled-components';

const Icon = styled.img((props) => ({
  marginRight: props.theme.spacing(4),
  width: 32,
  height: 32,
  borderRadius: 30,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
}));

const Container = styled.div({
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-end',
});

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  marginTop: 24,
  alignItems: 'center',
  justifyContent: 'center',
});

interface Props {
  image: string;
  title: string;
  value: string;
}

function FundsRow({ image, title, value }: Props) {
  return (
    <RowContainer>
      <Icon src={image} />
      <TitleText>{title}</TitleText>
      <Container>
        <ValueText>{value}</ValueText>
      </Container>
    </RowContainer>

  );
}

export default FundsRow;
