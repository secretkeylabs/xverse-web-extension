import OrdinalsIcon from '@assets/img/nftDashboard/ordinals_icon.svg';
import RuneIcon from '@assets/img/nftDashboard/rune_icon.svg';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useWalletSelector from '@hooks/useWalletSelector';
import { Container, SubTitle, Title } from '@screens/settings/index.styles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import FundsRow from './fundsRow';

function RestoreFunds() {
  const { t } = useTranslation('translation', { keyPrefix: 'RESTORE_FUND_SCREEN' });
  const { hasActivatedOrdinalsKey } = useWalletSelector();
  const navigate = useNavigate();

  const handleOnCancelClick = () => {
    navigate(-1);
  };

  const handleOnRestoreOrdinalClick = () => {
    navigate('/restore-ordinals');
  };

  const onRecoverRunesClick = () => {
    navigate('/recover-runes');
  };

  return (
    <>
      <TopRow onClick={handleOnCancelClick} />
      <Container>
        <Title>{t('TITLE')} </Title>
        <SubTitle>{t('DESCRIPTION')}</SubTitle>
        <FundsRow
          image={OrdinalsIcon}
          disabled={!hasActivatedOrdinalsKey}
          title={t('RECOVER_ORDINALS')}
          description={t('RECOVER_ORDINALS_DESC')}
          onClick={handleOnRestoreOrdinalClick}
        />
        <FundsRow
          image={RuneIcon}
          title={t('RECOVER_RUNES')}
          description={t('RECOVER_RUNES_DESC')}
          onClick={onRecoverRunesClick}
        />
      </Container>
      <BottomTabBar tab="settings" />
    </>
  );
}

export default RestoreFunds;
