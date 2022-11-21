import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import StackingStatusTile from './stackingStatusTile';

const Container = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  margin: props.theme.spacing(8),
  borderTop: `1px solid ${props.theme.colors.background.elevation3}`,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginTop: props.theme.spacing(16),
}));

const StackingDescriptionText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(18),
  color: props.theme.colors.white['200'],
}));
function StackingProgress() {
  const { t } = useTranslation('translation', { keyPrefix: 'STACKING_SCREEN' });

  return (
    <Container>
      <TitleText>{t('STACK_FOR_REWARD')}</TitleText>
      <StackingDescriptionText>{t('XVERSE_POOL')}</StackingDescriptionText>
      <StackingStatusTile />
    </Container>
  );
}

export default StackingProgress;
