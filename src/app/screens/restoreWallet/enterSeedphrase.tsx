import SeedPhraseInput from '@components/seedPhraseInput';
import BackButton from '@ui-library/backButton';
import Button from '@ui-library/button';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignSelf: 'flex-start',
});

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  marginTop: props.theme.space.l,
  marginBottom: props.theme.space.m,
}));

const Description = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.xxl,
}));

const ButtonContainer = styled.div((props) => ({
  width: '100%',
  marginBottom: props.theme.space.xxxl,
  display: 'flex',
  justifyContent: 'space-between',
  gap: props.theme.space.s,
}));

type Props = {
  seedPhrase: string;
  onSeedChange: (mnemonic: string) => void;
  onContinue: () => void;
  seedError: string;
  setSeedError: (err: string) => void;
  creatingWallet: boolean;
  onBack: () => void;
  initialShow24Words: boolean;
};

function EnterSeedPhrase({
  seedPhrase,
  onSeedChange,
  onContinue,
  seedError,
  setSeedError,
  creatingWallet,
  onBack,
  initialShow24Words,
}: Props): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'RESTORE_WALLET_SCREEN' });

  return (
    <Container>
      <BackButton onClick={onBack} disabled={creatingWallet} />
      <Title>{t('ENTER_SEED_TITLE')}</Title>
      <Description>{t('ENTER_SEED_DESCRIPTION')}</Description>
      <SeedPhraseInput
        onSeedChange={onSeedChange}
        seedError={seedError}
        setSeedError={setSeedError}
        initialShow24Words={initialShow24Words}
      />
      <ButtonContainer>
        <Button
          onClick={onContinue}
          disabled={seedPhrase === '' || creatingWallet}
          title={t('CONTINUE_BUTTON')}
          loading={creatingWallet}
        />
      </ButtonContainer>
    </Container>
  );
}

export default EnterSeedPhrase;
