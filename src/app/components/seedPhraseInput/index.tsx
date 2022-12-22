import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const InputContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const SeedPhraseInputLabel = styled.p((props) => ({
  textAlign: 'left',
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
const ErrorMessage = styled.h2((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  color: props.theme.colors.feedback.error,
  marginTop: props.theme.spacing(4),
}));

interface SeedPhraseInputProps {
  seed: string;
  onSeedChange: (seed: string) => void;
  seedError: string;
  setSeedError: (err: string) => void;
}

export default function SeedPhraseInput(props: SeedPhraseInputProps): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'RESTORE_WALLET_SCREEN' });
  const {
    onSeedChange, seed, seedError, setSeedError,
  } = props;

  const handleSeedChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    if (seedError) {
      setSeedError('');
    }
    onSeedChange(event.currentTarget.value);
  };

  return (
    <InputContainer>
      <SeedPhraseInputLabel>{t('SEED_INPUT_LABEL')}</SeedPhraseInputLabel>
      <SeedphraseInput
        value={seed}
        name="secretKey"
        placeholder={t('SEED_INPUT_PLACEHOLDER')}
        onChange={handleSeedChange}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
      />
      {seedError ? <ErrorMessage>{seedError}</ErrorMessage> : null}
    </InputContainer>
  );
}
