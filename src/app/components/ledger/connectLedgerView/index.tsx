import styled from 'styled-components';

import ledgerConnectDoneIcon from '@assets/img/ledger/ledger_import_connect_done.svg';
import ledgerConnectFailIcon from '@assets/img/ledger/ledger_import_connect_fail.svg';

export const ConnectLedgerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  > :first-child {
    margin-bottom: ${({ theme }) => theme.spacing(15)}px};
  }

  > :last-child {
    margin-top: 8px;
  }
`;

export const ConnectLedgerTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
}));

export const ConnectLedgerText = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[200],
  textAlign: 'center',
}));

interface LedgerConnectionProps {
  title: string;
  text: string;
  titleFailed: string;
  textFailed: string;
  imageDefault: string;
  isConnectSuccess: boolean;
  isConnectFailed: boolean;
}

function LedgerConnectionView({
  title,
  text,
  titleFailed,
  textFailed,
  imageDefault,
  isConnectSuccess,
  isConnectFailed,
}: LedgerConnectionProps) {
  let ledgerConnectIcon = imageDefault;

  if (isConnectSuccess && !isConnectFailed) {
    ledgerConnectIcon = ledgerConnectDoneIcon;
  } else if (!isConnectSuccess && isConnectFailed) {
    ledgerConnectIcon = ledgerConnectFailIcon;
  }

  return (
    <ConnectLedgerContainer>
      <img src={ledgerConnectIcon} alt="connect ledger device" />
      <ConnectLedgerTitle>{isConnectFailed ? titleFailed : title}</ConnectLedgerTitle>
      <ConnectLedgerText>{isConnectFailed ? textFailed : text}</ConnectLedgerText>
    </ConnectLedgerContainer>
  );
}

export default LedgerConnectionView;
