import { Signature, Wallet } from '@phosphor-icons/react';
import ActionCard from '@ui-library/actionCard';
import BackButton from '@ui-library/backButton';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { RestoreMethod } from './types';

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
  marginTop: props.theme.space.xxl,
  marginBottom: props.theme.space.m,
}));

const Description = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.xxl,
}));

const OptionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.s,
}));

type Props = {
  onContinue: (method: RestoreMethod) => void;
  onBack: () => void;
};

function RestoreMethodSelector({ onContinue, onBack }: Props): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'RESTORE_WALLET_SCREEN' });

  return (
    <Container>
      <BackButton onClick={onBack} />
      <Title>{t('RESTORE_WALLET')}</Title>
      <Description>{t('SELECT_RESTORE_METHOD.DESCRIPTION')}</Description>
      <OptionsContainer>
        <ActionCard
          data-testid="restore-manual-btn"
          icon={<Signature size={24} weight="light" />}
          label={t('SELECT_RESTORE_METHOD.RESTORE_MANUALLY')}
          description={t('SELECT_RESTORE_METHOD.TYPE_OR_PASTE_SEED_PHRASE')}
          withArrow
          onClick={() => onContinue('seed')}
        />
        <ActionCard
          data-testid="restore-import-btn"
          icon={<Wallet size={24} weight="fill" />}
          label={t('SELECT_RESTORE_METHOD.IMPORT_FROM_OTHER_WALLET')}
          description={t('SELECT_RESTORE_METHOD.AUTOMATICALLY_RESTORE_YOUR_WALLET')}
          withArrow
          onClick={() => onContinue('wallet')}
        />
      </OptionsContainer>
    </Container>
  );
}

export default RestoreMethodSelector;
