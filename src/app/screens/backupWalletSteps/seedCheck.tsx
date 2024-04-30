import SeedphraseView from '@components/seedPhraseView';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import Button from '@ui-library/button';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const Heading = styled.p((props) => ({
  ...props.theme.typography.body_l,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.spacing(20),
}));

const Label = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(4),
}));

const StyledButton = styled(Button)((props) => ({
  marginBottom: props.theme.space.xxxl,
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: props.theme.space.s,
}));

interface SeedCheckPros {
  onContinue: () => void;
  seedPhrase: string;
}

export default function SeedCheck(props: SeedCheckPros): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'BACKUP_WALLET_SCREEN' });
  const { onContinue, seedPhrase } = props;
  const [isVisible, setIsVisible] = useState<boolean>(false);
  return (
    <Container>
      <Heading>{t('SEED_PHRASE_VIEW_HEADING')}</Heading>
      <Label>{t('SEED_PHRASE_VIEW_LABEL')}</Label>
      <SeedphraseView seedPhrase={seedPhrase} isVisible={isVisible} />
      <ButtonContainer>
        <StyledButton
          icon={isVisible ? <EyeSlash weight="bold" size={16} /> : <Eye weight="bold" size={16} />}
          type="button"
          variant="secondary"
          title={isVisible ? t('SEED_PHRASE_VIEW_HIDE') : t('SEED_PHRASE_VIEW_REVEAL')}
          onClick={() => setIsVisible(!isVisible)}
        />
        <StyledButton
          disabled={!isVisible}
          onClick={onContinue}
          title={t('SEED_PHRASE_VIEW_CONTINUE')}
        />
      </ButtonContainer>
    </Container>
  );
}
