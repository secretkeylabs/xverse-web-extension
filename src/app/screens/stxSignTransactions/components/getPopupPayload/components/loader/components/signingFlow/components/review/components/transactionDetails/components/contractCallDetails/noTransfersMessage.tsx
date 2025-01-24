import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import { Card } from '../card';

export function NoTransfersMessage() {
  const { t } = useTranslation('translation');
  return (
    <Card>
      <StyledP color="white_200" typography="body_medium_l">
        {t('CONTRACT_CALL_REQUEST.POST_CONDITION_ALERT')}
      </StyledP>
    </Card>
  );
}
