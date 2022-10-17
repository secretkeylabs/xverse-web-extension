import SeedPhraseInput from '@components/seedPhraseInput';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const Title = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['400'],
  marginTop: props.theme.spacing(21),
  marginBottom: props.theme.spacing(16),
}));

const ContinueButton = styled.button((props) => ({
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.action.classic,
  color: props.theme.colors.white['0'],
  width: '100%',
  height: 44,
  marginTop: 'auto',
  marginBottom: props.theme.spacing(30),
}));

interface Props {
  seed: string,
  setSeed: (seed: string) => void,
  onContinue: () => void,
  seedError: string,
  setSeedError: (err: string) => void,
}

function EnterSeedPhrase(props: Props): JSX.Element {
  const {
    onContinue,
    seed,
    setSeed,
    seedError,
    setSeedError,
  } = props;

  const { t } = useTranslation('translation', { keyPrefix: 'RESTORE_WALLET_SCREEN' });

  return (
    <Container>
      <Title>
        {t('ENTER_SEED_HEADER')}
      </Title>
      <SeedPhraseInput
        seed={seed}
        onSeedChange={setSeed}
        seedError={seedError}
        setSeedError={setSeedError}
      />
      <ContinueButton onClick={onContinue}>
        {t('CONTINUE_BUTTON')}
      </ContinueButton>
    </Container>
  );
}

export default EnterSeedPhrase;
