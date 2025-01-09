import SeedPhraseInput from '@components/seedPhraseInput';
import Button from '@ui-library/button';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignSelf: 'flex-start',
});

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  marginTop: props.theme.space.xxl,
  marginBottom: props.theme.space.m,
}));

const Description = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.xxl,
}));

const ButtonContainer = styled.div((props) => ({
  width: '100%',
  margin: '0 auto',
  marginBottom: props.theme.space.xxxl,
}));

type Props = {
  seed: string;
  setSeed: (seed: string) => void;
  onContinue: () => void;
  seedError: string;
  setSeedError: (err: string) => void;
};

function EnterSeedPhrase({
  seed,
  setSeed,
  onContinue,
  seedError,
  setSeedError,
}: Props): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'RESTORE_WALLET_SCREEN' });

  return (
    <Container>
      <Title>{t('ENTER_SEED_TITLE')}</Title>
      <Description>{t('ENTER_SEED_DESCRIPTION')}</Description>
      <SeedPhraseInput onSeedChange={setSeed} seedError={seedError} setSeedError={setSeedError} />
      <ButtonContainer>
        <Button onClick={onContinue} disabled={seed === ''} title={t('CONTINUE_BUTTON')} />
      </ButtonContainer>
    </Container>
  );
}

export default EnterSeedPhrase;
