import BitcoinIcon from '@assets/img/dashboard/bitcoin_icon.svg';
import OrdinalsIcon from '@assets/img/nftDashboard/ordinals_icon.svg';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import FundsRow from './fundsRow';

const RestoreFundTitle = styled.h1((props) => ({
  ...props.theme.body_l,
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
  const navigate = useNavigate();

  const handleOnCancelClick = () => {
    navigate(-1);
  };

  const handleOnRestoreBtcClick = () => {
    navigate('/recover-btc');
  };

  const handleOnRestoreOridnalClick = () => {
    navigate('/recover-ordinals');
  };

  return (
    <>
      <TopRow title={t('TITLE')} onClick={handleOnCancelClick} />
      <RestoreFundTitle>{t('DESCRIPTION')}</RestoreFundTitle>
      <Container>
        {/* <FundsRow image={BitcoinIcon} title={t('RECOVER_BTC')} description={t('RECOVER_BTC_DESC')} onClick={handleOnRestoreBtcClick} /> */}
        <FundsRow
          image={OrdinalsIcon}
          title={t('RECOVER_ORDINALS')}
          description={t('RECOVER_ORDINALS_DESC')}
          onClick={handleOnRestoreOridnalClick}
        />
      </Container>
      <BottomTabBar tab="nft" />
    </>
  );
}

export default RestoreFunds;
