import backup from '@assets/img/backupWallet/backup.svg';
import Button from '@ui-library/button';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { CreateType } from './common';

const Container = styled.div((props) => ({
  flex: 1,
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  display: 'flex',
  flexDirection: 'column',
}));

const IconContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
});

const ContentContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  marginBottom: props.theme.space.xxxl,
}));

const Title = styled.h1((props) => ({
  ...props.theme.typography.body_bold_l,
  textAlign: 'center',
}));

const SubTitle = styled.h2((props) => ({
  ...props.theme.typography.body_l,
  textAlign: 'center',
  marginTop: props.theme.space.xs,
  color: props.theme.colors.white_200,
}));

const BackupActionsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: props.theme.space.xxl,
  width: '100%',
  columnGap: props.theme.space.xs,
}));

type Props = {
  onTypeSelected: (type: CreateType) => void;
};

function SelectCreateType({ onTypeSelected }: Props): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'BACKUP_WALLET_SCREEN' });

  const handleBackup = () => {
    onTypeSelected(CreateType.WITH_BACKUP);
  };

  const handleSkip = () => {
    onTypeSelected(CreateType.SKIP_BACKUP);
  };

  return (
    <Container>
      <IconContainer>
        <img src={backup} alt="backup" width={208} />
      </IconContainer>
      <ContentContainer>
        <Title>{t('SCREEN_TITLE')}</Title>
        <SubTitle>{t('SCREEN_SUBTITLE')}</SubTitle>
        <BackupActionsContainer>
          <Button onClick={handleSkip} variant="secondary" title={t('BACKUP_SKIP_BUTTON')} />
          <Button onClick={handleBackup} title={t('BACKUP_BUTTON')} />
        </BackupActionsContainer>
      </ContentContainer>
    </Container>
  );
}

export default SelectCreateType;
