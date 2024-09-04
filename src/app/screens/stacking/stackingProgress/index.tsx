import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import StackingStatusTile from './stackingStatusTile';

const Container = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  marginLeft: props.theme.space.m,
  marginRight: props.theme.space.m,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginTop: props.theme.space.xl,
}));

const StackingDescriptionText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  marginTop: props.theme.space.xs,
  marginBottom: props.theme.space.l,
  color: props.theme.colors.white_200,
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
