import OrdinalsIcon from '@assets/img/nftDashboard/ordinals_icon.svg';
import RuneIcon from '@assets/img/nftDashboard/rune_icon.svg';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useWalletSelector from '@hooks/useWalletSelector';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import FundsRow from './fundsRow';

const RestoreFundTitle = styled.h1((props) => ({
  ...props.theme.typography.body_l,
  marginBottom: 15,
  marginTop: 24,
  marginLeft: 16,
  marginRight: 16,
  color: props.theme.colors.white_200,
}));

const Container = styled.div({
  flex: 1,
  marginTop: 32,
  paddingLeft: 16,
  paddingRight: 16,
});

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
      <TopRow title={t('TITLE')} onClick={handleOnCancelClick} />
      <RestoreFundTitle>{t('DESCRIPTION')}</RestoreFundTitle>
      <Container>
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
