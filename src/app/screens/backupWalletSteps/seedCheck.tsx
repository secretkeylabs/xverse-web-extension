import SeedphraseView from '@components/seedPhraseView';
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

const ContinueButton = styled(Button)((props) => ({
  marginBottom: props.theme.space.xxxl,
}));

interface SeedCheckPros {
  onContinue: () => void;
  seedPhrase: string;
  showButton?: boolean;
}

export default function SeedCheck(props: SeedCheckPros): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'BACKUP_WALLET_SCREEN' });
  const { onContinue, seedPhrase, showButton = true } = props;
  const [isVisible, setIsVisible] = useState<boolean>(false);
  return (
    <Container>
      <Heading>{t('SEED_PHRASE_VIEW_HEADING')}</Heading>
      <Label>{t('SEED_PHRASE_VIEW_LABEL')}</Label>
      <SeedphraseView seedPhrase={seedPhrase} isVisible={isVisible} setIsVisible={setIsVisible} />
      {showButton && (
        <ContinueButton
          disabled={!isVisible}
          onClick={onContinue}
          title={t('SEED_PHRASE_VIEW_CONTINUE')}
        />
      )}
    </Container>
  );
}
