import styled from 'styled-components';

import LedgerConnectDoneSVG from '@assets/img/ledger/ledger_import_connect_done.svg';
import LedgerConnectFailSVG from '@assets/img/ledger/ledger_import_connect_fail.svg';

const ConnectLedgerContainer = styled.div`
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

const ConnectLedgerTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
}));

const ConnectLedgerText = styled.p((props) => ({
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
  return (
    <ConnectLedgerContainer>
      <img
        src={
          !isConnectSuccess
            ? isConnectFailed
              ? LedgerConnectFailSVG
              : imageDefault
            : LedgerConnectDoneSVG
        }
        alt="connect ledger device"
      />
      <ConnectLedgerTitle>{isConnectFailed ? titleFailed : title}</ConnectLedgerTitle>
      <ConnectLedgerText>{isConnectFailed ? textFailed : text}</ConnectLedgerText>
    </ConnectLedgerContainer>
  );
}

export default LedgerConnectionView;
