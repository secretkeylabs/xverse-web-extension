import ActionButton from '@components/button';
import SeedPhraseInput from '@components/seedPhraseInput';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  paddingTop: props.theme.spacing(21),
  flexDirection: 'column',
  flex: 1,
}));

const Heading = styled.p((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white[200],
  marginBottom: props.theme.spacing(15),
}));

const ButtonsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  flex: 1,
  alignItems: 'flex-end',
  marginBottom: props.theme.spacing(30),
  width: '100%',
}));

const TransparentButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

const ButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(2),
  width: '100%',
}));

interface VerifySeedProps {
  onVerifySuccess: () => void;
  onBack: () => void;
  seedPhrase: string;
}

export default function VerifySeed(props: VerifySeedProps): JSX.Element {
  const [seedInput, setSeedInput] = useState<string>('');
  const [err, setErr] = useState('');
  const { t } = useTranslation('translation', { keyPrefix: 'BACKUP_WALLET_SCREEN' });
  const { onBack, onVerifySuccess, seedPhrase } = props;

  const cleanMnemonic = (rawSeed: string): string => rawSeed.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim();

  const handleVerify = () => {
    if (seedPhrase === cleanMnemonic(seedInput)) {
      onVerifySuccess();
    } else {
      setErr('Seedphrase does not match');
    }
  };

  return (
    <Container>
      <Heading>{t('SEED_PHRASE_VERIFY_HEADING')}</Heading>
      <SeedPhraseInput
        seed={seedInput}
        onSeedChange={setSeedInput}
        seedError={err}
        setSeedError={setErr}
      />
      <ButtonsContainer>
        <TransparentButtonContainer>
          <ActionButton
            onPress={onBack}
            transparent
            text={t('SEED_PHRASE_BACK_BUTTON')}
          />
        </TransparentButtonContainer>
        <ButtonContainer>
          <ActionButton
            text={t('SEED_PHRASE_VERIFY_BUTTON')}
            onPress={handleVerify}
            disabled={seedInput === ''}
          />
        </ButtonContainer>
      </ButtonsContainer>
    </Container>
  );
}
