import BtcLogo from '@assets/img/btcFlashy.svg';
import Button from '@ui-library/button';
import Sheet from '@ui-library/sheet';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const LogoContainer = styled.div(() => ({
  display: 'flex',
  justifyContent: 'center',
}));

const LogoImg = styled.img(() => ({
  height: '135px',
}));

const DescriptionItem = styled.div<{ $bottomSpacer?: boolean }>((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.$bottomSpacer ? props.theme.space.m : 0,
}));

const HighlightSpan = styled.span`
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_0};
`;

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: props.theme.space.s,
  marginTop: props.theme.space.xl,
}));

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

export default function NativeSegWit({ isVisible, onClose }: Props) {
  const { t } = useTranslation('translation', {
    keyPrefix: 'DASHBOARD_SCREEN.ANNOUNCEMENTS.NATIVE_SEGWIT',
  });
  const navigate = useNavigate();

  const onNavigate = () => {
    navigate('/preferred-address');
    onClose();
  };

  return (
    <Sheet
      title={t('TITLE')}
      logo={
        <LogoContainer>
          <LogoImg src={BtcLogo} alt="BTC" />
        </LogoContainer>
      }
      onClose={onClose}
      visible={isVisible}
    >
      <DescriptionItem $bottomSpacer>
        {t('DESCRIPTION_1a')}
        <HighlightSpan>{t('DESCRIPTION_1b')}</HighlightSpan>
        {t('DESCRIPTION_1c')}
      </DescriptionItem>
      <DescriptionItem $bottomSpacer>{t('DESCRIPTION_2')}</DescriptionItem>
      <DescriptionItem>{t('DESCRIPTION_3')}</DescriptionItem>
      <ButtonContainer>
        <Button title={t('SELECT')} onClick={onNavigate} />
        <Button title={t('LATER')} onClick={onClose} variant="secondary" />
      </ButtonContainer>
    </Sheet>
  );
}
