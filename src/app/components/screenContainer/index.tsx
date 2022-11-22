import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

const RouteContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 600,
  width: 360,
  margin: 'auto',
  backgroundColor: props.theme.colors.background.elevation0,
  border: '1px solid rgba(126, 137,171,0.2)',
  boxShadow: '0px 8px 28px rgba(0, 0, 0, 0.35)',
}));

function ScreenContainer(): JSX.Element {
  return (
    <RouteContainer>
      <Outlet />
    </RouteContainer>
  );
}

export default ScreenContainer;
