import styled from 'styled-components';

const Line = styled.div((props) => ({
  width: '100%',
  height: 0,
  border: `1px solid ${props.theme.colors.background.elevation3}`,
  marginTop: props.theme.spacing(8),
}));

function Seperator() {
  return <Line />;
}

export default Seperator;
