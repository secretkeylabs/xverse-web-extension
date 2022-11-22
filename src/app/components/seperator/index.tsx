import styled from 'styled-components';

const Line = styled.div((props) => ({
  border: `1px solid ${props.theme.colors.background.elevation3}`,
  marginTop: props.theme.spacing(8),
}));

function Seperator() {
  return <Line />;
}

export default Seperator;
