import styled from 'styled-components';

import XverseLogoSVG from '@assets/img/settings/logo.svg';

declare const VERSION: string;

const HeaderRow = styled.div((props) => ({
  position: 'absolute',
  width: '100%',
  top: props.theme.spacing(5),
  left: 0,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '32px 100px',
}));

const XverseLogo = styled.img((props) => ({
  height: '18px',
}));

const VersionText = styled.p((props) => ({
  ...props.theme.body_xs,
  fontSize: '18px',
  color: props.theme.colors.white_200,
}));

function FullScreenHeader() {
  return (
    <HeaderRow>
      <XverseLogo src={XverseLogoSVG} />
      <VersionText>V{VERSION}</VersionText>
    </HeaderRow>
  );
}

export default FullScreenHeader;
