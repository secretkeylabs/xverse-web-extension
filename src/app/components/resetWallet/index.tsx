import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ResetWalletText = styled.h1((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white['200'],
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  paddingTop: props.theme.spacing(12),
  paddingBottom: props.theme.spacing(12),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  paddingBottom: props.theme.spacing(16),
}));

const TransparentButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

const ResetButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(2),
  width: '100%',
}));

interface Props {
  showResetWalletPrompt: boolean;
  onResetWalletPromptClose: () => void;
  openResetWalletScreen: () => void;
}
function ResetWalletPrompt({ showResetWalletPrompt, onResetWalletPromptClose, openResetWalletScreen }:Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  return (
    <BottomModal
      visible={showResetWalletPrompt}
      header={t('RESET_WALLET')}
      onClose={onResetWalletPromptClose}
    >
      <ResetWalletText>{t('RESET_WALLET_DESCRIPTION')}</ResetWalletText>
      <ButtonContainer>
        <TransparentButtonContainer>
          <ActionButton
            text={t('CANCEL')}
            transparent
            onPress={onResetWalletPromptClose}
          />
        </TransparentButtonContainer>
        <ResetButtonContainer>
          <ActionButton
            text={t('RESET_WALLET')}
            warning
            onPress={openResetWalletScreen}
          />
        </ResetButtonContainer>
      </ButtonContainer>
    </BottomModal>
  );
}

export default ResetWalletPrompt;
