import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

const RouteContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: props.theme.colors.background.elevation0,
}));

function ScreenContainer(): JSX.Element {
  return (
    <RouteContainer>
      <Outlet />
    </RouteContainer>
  );
}

export default ScreenContainer;
