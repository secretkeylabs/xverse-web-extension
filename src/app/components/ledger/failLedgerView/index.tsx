import styled from 'styled-components';

import ledgerConnectFailIcon from '@assets/img/ledger/ledger_import_connect_fail.svg';

const Container = styled.div`
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

const Title = styled.h1((props) => ({
  ...props.theme.headline_s,
}));

const Text = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[200],
  textAlign: 'center',
}));

interface LedgerConnectionProps {
  title: string;
  text: string;
}

function LedgerFailView({ title, text }: LedgerConnectionProps) {
  return (
    <Container>
      <img src={ledgerConnectFailIcon} alt="" />
      <Title>{title}</Title>
      <Text>{text}</Text>
    </Container>
  );
}

export default LedgerFailView;
