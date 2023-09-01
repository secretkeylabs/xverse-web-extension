import SeedphraseView from '@components/seedPhraseView';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface ButtonProps {
  enabled: boolean;
}

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const Heading = styled.p((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.spacing(20),
}));

const Label = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(4),
}));

const ContinueButton = styled.button<ButtonProps>((props) => ({
  display: 'flex',
  ...props.theme.body_bold_m,
  fontSize: 12,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.action.classic,
  marginBottom: props.theme.spacing(30),
  color: props.theme.colors.elevation0,
  width: '100%',
  height: 44,
  opacity: props.enabled ? 1 : 0.6,
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
        <ContinueButton enabled={isVisible} onClick={onContinue}>
          {t('SEED_PHRASE_VIEW_CONTINUE')}
        </ContinueButton>
      )}
    </Container>
  );
}
