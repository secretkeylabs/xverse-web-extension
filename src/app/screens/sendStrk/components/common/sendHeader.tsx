import TokenImage from '@components/tokenImage';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: theme.space.xxs,
}));

const TitleText = styled.div(({ theme }) => ({
  ...theme.typography.headline_xs,
}));

export default function SendHeader() {
  const { t } = useTranslation('translation');

  return (
    <Container>
      <TokenImage currency="STRK" />
      <TitleText>{t('SEND.SEND')}</TitleText>
    </Container>
  );
}
