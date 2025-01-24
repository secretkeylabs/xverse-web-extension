import Button from '@ui-library/button';
import styled from 'styled-components';

const Container = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  columnGap: theme.space.s,
  paddingTop: theme.space.l,
  paddingBottom: theme.space.l,
}));

type Action = { title: string; onClick?: () => void; disabled?: boolean; loading?: boolean };

export type Props = {
  main: Action;
  secondary?: Action;
};

export function Actions({ main, secondary }: Props) {
  return (
    <Container>
      {secondary && <Button {...secondary} variant="secondary" />}
      <Button {...main} />
    </Container>
  );
}
