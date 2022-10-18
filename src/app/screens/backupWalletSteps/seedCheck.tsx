import SeedphraseView from '@components/seedPhraseView';
import { StoreState } from '@stores/index';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
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
  marginBottom: props.theme.spacing(20),
}));

const Label = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
  marginBottom: props.theme.spacing(4),
}));

const ContinueButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.action.classic,
  marginTop: 'auto',
  marginBottom: props.theme.spacing(30),
  color: props.theme.colors.white['0'],
  width: '100%',
  height: 44,
}));

interface SeedCheckPros {
  onContinue: () => void,
  seedPhrase: string,
}

export default function SeedCheck(props: SeedCheckPros): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'BACKUP_WALLET_SCREEN' });
  const {
    onContinue,
    seedPhrase,
  } = props;
  return (
    <Container>
      <Heading>
        {t('SEED_PHRASE_VIEW_HEADING')}
      </Heading>
      <Label>
        {t('SEED_PHRASE_VIEW_LABEL')}
      </Label>
      <SeedphraseView seedPhrase={seedPhrase} />
      <ContinueButton onClick={onContinue}>
        {t('SEED_PHRASE_VIEW_CONTINUE')}
      </ContinueButton>
    </Container>
  );
}
