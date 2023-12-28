import styled from 'styled-components';
import Theme from 'theme';

const Divider = styled.div<{ verticalMargin: keyof typeof Theme.space }>((props) => ({
  display: 'flex',
  width: '100%',
  height: 1,
  backgroundColor: props.theme.colors.white_900,
  margin: `${props.theme.space[props.verticalMargin]} 0`,
}));
export default Divider;
