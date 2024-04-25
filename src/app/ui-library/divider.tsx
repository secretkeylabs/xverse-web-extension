import styled from 'styled-components';
import Theme from 'theme';

const Divider = styled.div<{
  verticalMargin: keyof typeof Theme.space;
  color?: keyof typeof Theme.colors;
}>((props) => ({
  display: 'flex',
  width: '100%',
  height: 1,
  backgroundColor: props.color
    ? String(props.theme.colors[props.color])
    : props.theme.colors.white_900,
  margin: `${props.theme.space[props.verticalMargin]} 0`,
}));
export default Divider;
