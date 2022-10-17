import React, { useState } from 'react';
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
}));

const SeedPhraseInputLabel = styled.p((props) => ({
  textAlign: 'left',
  marginTop: props.theme.spacing(16),
  marginBottom: props.theme.spacing(8),
}));

const SeedphraseInput = styled.textarea((props) => ({
  ...props.theme.body_medium_m,
  backgroundColor: props.theme.colors.background.elevation0,
  color: props.theme.colors.white['0'],
  width: '100%',
  resize: 'none',
  minHeight: 140,
  padding: props.theme.spacing(8),
  border: '1px solid #272A44',
  borderRadius: props.theme.radius(1),
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

const ErrorMessage = styled.h2((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  color: props.theme.colors.feedback.error,
  marginTop: props.theme.spacing(4),
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

  const onSeedChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    if (seedError) {
      setSeedError('');
    }
    setSeed(event.currentTarget.value);
  };

  const handleContinue = () => {};

  return (
    <Container>
      <Title>{t('ENTER_SEED_HEADER')}</Title>
      <SeedPhraseInputLabel>{t('SEED_INPUT_LABEL')}</SeedPhraseInputLabel>
      <SeedphraseInput
        value={seed}
        name="secretKey"
        placeholder={t('SEED_INPUT_PLACEHOLDER')}
        onChange={onSeedChange}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
      />
      {seedError ? <ErrorMessage>{seedError}</ErrorMessage> : null}
      <ContinueButton onClick={onContinue}>{t('CONTINUE_BUTTON')}</ContinueButton>
    </Container>
  );
}

export default EnterSeedPhrase;
