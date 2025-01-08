import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Container, Title } from '../../../../styles';

import { CircleWavyCheck } from '@phosphor-icons/react';
import { StyledP } from '@ui-library/common.styled';

const MessageContainer = styled.div(({ theme }) => ({
  display: 'flex',
  columnGap: theme.space.xs,
  paddingBlockStart: theme.space.s,
  alignItems: 'flex-start',

  color: theme.colors.white_200,
}));

const MessageIconContainer = styled.div({
  paddingBlockStart: '3px', // Custom design adjustment for optimal layout.
  flexShrink: 0,
});

export function Sponsored() {
  const { t } = useTranslation('translation');

  return (
    <Container>
      <Title>{t('CONFIRM_TRANSACTION.FEES')}</Title>
      <MessageContainer>
        <MessageIconContainer>
          <CircleWavyCheck size={24} />
        </MessageIconContainer>
        <StyledP typography="body_m">{t('CONFIRM_TRANSACTION.SPONSORED_TX_INFO')}</StyledP>
      </MessageContainer>
    </Container>
  );
}
