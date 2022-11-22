import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

const ExtendedScreenRouteContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100vw',
  backgroundColor: props.theme.colors.background.elevation0,
  border: '1px solid #272a44',
  boxShadow: '0px 8px 28px rgba(0, 0, 0, 0.35)',
}));

function ExtendedScreenContainer(): JSX.Element {
  return (
    <ExtendedScreenRouteContainer>
      <Outlet />
    </ExtendedScreenRouteContainer>
  );
}

export default ExtendedScreenContainer;
