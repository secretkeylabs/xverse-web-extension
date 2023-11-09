import styled from 'styled-components';

const Container = styled.h1((props) => ({
  display: 'flex',
  borderRadius: 20,
  border: `1px solid ${props.theme.colors.elevation3}`,
  flexDirection: 'row',
  marginEnd: 10,
  padding: props.theme.spacing(5),
  alignItems: 'center',
}));

const TypeText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_400,
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
  wordBreak: 'break-all',
  marginLeft: props.theme.spacing(3),
}));

interface Props {
  type: string;
  value: string;
}

function NftAttribute({ type, value }: Props) {
  return (
    <Container>
      <TypeText>{type}</TypeText>
      <ValueText>{value}</ValueText>
    </Container>
  );
}

export default NftAttribute;
