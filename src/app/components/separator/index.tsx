import styled from 'styled-components';

const Line = styled.div((props) => ({
  border: `0.5px solid ${props.theme.colors.background.elevation3}`,
  marginTop: props.theme.spacing(8),
}));

function Separator() {
  return <Line />;
}

export default Separator;
