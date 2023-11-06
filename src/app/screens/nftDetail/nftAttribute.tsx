import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  borderRadius: 12,
  border: `1px solid ${props.theme.colors.elevation3}`,
  flexDirection: 'column',
  padding: '8px 16px',
  alignItems: 'flex-start',
}));

const TypeText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_400,
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  wordBreak: 'break-all',
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
