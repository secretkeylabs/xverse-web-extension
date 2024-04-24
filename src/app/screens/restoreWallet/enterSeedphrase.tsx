import SeedPhraseInput from '@components/seedPhraseInput';
import Button from '@ui-library/button';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Form = styled.form({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignSelf: 'flex-start',
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
    <Form
      onSubmit={(e) => {
        e.preventDefault();

        onContinue();
      }}
    >
      <Title>{t('ENTER_SEED_HEADER')}</Title>
      <SeedPhraseInput onSeedChange={setSeed} seedError={seedError} setSeedError={setSeedError} />
      <ButtonContainer>
        <Button onClick={onContinue} disabled={seed === ''} title={t('CONTINUE_BUTTON')} />
      </ButtonContainer>
    </Form>
  );
}

export default EnterSeedPhrase;
