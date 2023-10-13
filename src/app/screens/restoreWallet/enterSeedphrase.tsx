import ActionButton from '@components/button';
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
  ...props.theme.body_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(21),
  marginBottom: props.theme.spacing(16),
  textAlign: 'center',
}));

const ButtonContainer = styled.div((props) => ({
  width: '100%',
  marginTop: 'auto',
  marginBottom: props.theme.spacing(30),
}));

interface Props {
  seed: string;
  setSeed: (seed: string) => void;
  onContinue: () => void;
  seedError: string;
  setSeedError: (err: string) => void;
}

function EnterSeedPhrase(props: Props): JSX.Element {
  const { onContinue, seed, setSeed, seedError, setSeedError } = props;

  const { t } = useTranslation('translation', { keyPrefix: 'RESTORE_WALLET_SCREEN' });

  return (
    <Container>
      <Title>{t('ENTER_SEED_HEADER')}</Title>
      <SeedPhraseInput onSeedChange={setSeed} seedError={seedError} setSeedError={setSeedError} />
      <ButtonContainer>
        <ActionButton onPress={onContinue} disabled={seed === ''} text={t('CONTINUE_BUTTON')} />
      </ButtonContainer>
    </Container>
  );
}

export default EnterSeedPhrase;
