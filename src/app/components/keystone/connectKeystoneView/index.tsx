import styled from 'styled-components';

import keystoneConnectDoneIcon from '@assets/img/keystone/keystone_import_connect_done.svg';
import keystoneConnectFailIcon from '@assets/img/keystone/keystone_import_connect_fail.svg';

export const ConnectKeystoneContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  > :first-child {
    margin-bottom: ${({ theme }) => theme.spacing(15)}px};
  }

  > :last-child {
    margin-top: 8px;
  }
`;

const ConnectKeystoneTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
}));

export const ConnectKeystoneText = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_200,
  textAlign: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
  paddingLeft: props.theme.spacing(6),
  paddingRight: props.theme.spacing(6),
}));

interface KeystoneConnectionProps {
  title: string;
  text: string;
  titleFailed: string;
  textFailed: string;
  imageDefault: string;
  isConnectSuccess: boolean;
  isConnectFailed: boolean;
}

function KeystoneConnectionView({
  title,
  text,
  titleFailed,
  textFailed,
  imageDefault,
  isConnectSuccess,
  isConnectFailed,
}: KeystoneConnectionProps) {
  let keystoneConnectIcon = imageDefault;

  if (isConnectSuccess && !isConnectFailed) {
    keystoneConnectIcon = keystoneConnectDoneIcon;
  } else if (!isConnectSuccess && isConnectFailed) {
    keystoneConnectIcon = keystoneConnectFailIcon;
  }

  return (
    <ConnectKeystoneContainer>
      <img src={keystoneConnectIcon} alt="connect keystone device" />
      <ConnectKeystoneTitle>{isConnectFailed ? titleFailed : title}</ConnectKeystoneTitle>
      <ConnectKeystoneText>{isConnectFailed ? textFailed : text}</ConnectKeystoneText>
    </ConnectKeystoneContainer>
  );
}

export default KeystoneConnectionView;
