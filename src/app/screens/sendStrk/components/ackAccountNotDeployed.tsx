import { truncateAddress } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StickyHorizontalSplitButtonContainer, StyledP } from '@ui-library/common.styled';
import SendLayout from 'app/layouts/sendLayout';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Title = styled.p(({ theme }) => ({
  ...theme.typography.body_medium_m,
  color: theme.colors.white_200,
}));

const Container = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  rowGap: theme.space.l,
}));

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
  onBack: () => void;
  recipientAddress: string;
};

export function AckAccountNotDeployed(props: Props) {
  const { recipientAddress, onCancel, onConfirm, onBack } = props;
  const { t } = useTranslation('translation');

  return (
    <SendLayout selectedBottomTab="dashboard" onClickBack={onBack}>
      <Container>
        <StyledP typography="headline_s">{t('SEND.STRK.ACCOUNT_NOT_DEPLOYED_TITLE')}</StyledP>

        <Title>{t('SEND.STRK.ACCOUNT_NOT_DEPLOYED_WARNING')}</Title>

        <p>{truncateAddress(recipientAddress)}</p>
      </Container>

      <StickyHorizontalSplitButtonContainer>
        <Button title={t('COMMON.CANCEL')} onClick={onCancel} variant="secondary" />
        <Button title={t('COMMON.CONFIRM')} onClick={onConfirm} />
      </StickyHorizontalSplitButtonContainer>
    </SendLayout>
  );
}
