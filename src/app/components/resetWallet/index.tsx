import Button from '@ui-library/button';
import Sheet from '@ui-library/sheet';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ResetWalletText = styled.div((props) => ({
  ...props.theme.typography.body_l,
  color: props.theme.colors.white_200,
  paddingTop: props.theme.space.xs,
  paddingBottom: props.theme.space.l,
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: props.theme.space.xs,
  paddingBottom: props.theme.space.xl,
}));

type Props = {
  showResetWalletPrompt: boolean;
  onResetWalletPromptClose: () => void;
  openResetWalletScreen: () => void;
};

function ResetWalletPrompt({
  showResetWalletPrompt,
  onResetWalletPromptClose,
  openResetWalletScreen,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  return (
    <Sheet
      visible={showResetWalletPrompt}
      title={t('RESET_WALLET')}
      onClose={onResetWalletPromptClose}
    >
      <ResetWalletText>{t('RESET_WALLET_DESCRIPTION')}</ResetWalletText>
      <ButtonContainer>
        <Button title={t('CANCEL')} variant="secondary" onClick={onResetWalletPromptClose} />
        <Button title={t('RESET_WALLET')} variant="danger" onClick={openResetWalletScreen} />
      </ButtonContainer>
    </Sheet>
  );
}

export default ResetWalletPrompt;
