import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Container, Title } from '../../../../styles';
import { Card, CardRowContainer, CardRowPrimary, CardRowSecondary } from '../../../card';
import { EditButton } from '../edit';

export type FeeLogicProps = {
  fee: ReactNode;
  feeInCurrency?: ReactNode;
  feePriority?: ReactNode;
  onEdit?: () => void;
};

const SecondaryTitleContainer = styled.div(({ theme }) => ({
  ...theme.typography.body_medium_m,
  display: 'flex',
  alignItems: 'center',
  columnGap: theme.space.xs,
}));

const TitleContainer = styled.div(({ theme }) => ({
  color: theme.colors.white_0,
}));

export function FeeLogic({ onEdit, fee, feePriority, feeInCurrency }: FeeLogicProps) {
  const { t } = useTranslation();

  const isShowingSecondary = Boolean(onEdit || feePriority || feeInCurrency);
  const primaryTitle = t('CONFIRM_TRANSACTION.NETWORK_FEE');
  return (
    <Container>
      <Title>{t('CONFIRM_TRANSACTION.FEES')}</Title>
      <Card>
        <CardRowContainer>
          <CardRowPrimary title={<TitleContainer>{primaryTitle}</TitleContainer>} value={fee} />
          {isShowingSecondary && (
            <CardRowSecondary
              title={
                <SecondaryTitleContainer>
                  {feePriority && <div>{feePriority}</div>}
                  {onEdit && <EditButton data-testid="fee-button" onClick={onEdit} />}
                </SecondaryTitleContainer>
              }
              value={feeInCurrency}
            />
          )}
        </CardRowContainer>
      </Card>
    </Container>
  );
}
