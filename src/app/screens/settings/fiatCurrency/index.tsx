import styled from 'styled-components';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useWalletSelector from '@hooks/useWalletSelector';
import { ChangeFiatCurrencyAction } from '@stores/wallet/actions/actionCreators';
import { SupportedCurrency } from '@secretkeylabs/xverse-core';
import { currencyList } from '../../../utils/currency';
import CurrencyRow from './currencyRow';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

function FiatCurrencyScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const { fiatCurrency } = useWalletSelector();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleBackButtonClick = () => {
    navigate('/settings');
  };

  const onClick = (currency: SupportedCurrency) => {
    dispatch(ChangeFiatCurrencyAction(currency));
  };

  function showDivider(index: number): boolean {
    return !(index === currencyList.length - 1);
  }

  return (
    <>
      <TopRow title={t('CURRENCY')} onClick={handleBackButtonClick} />
      <Container>
        {currencyList.map((coin, index) => (
          <CurrencyRow
            currency={coin}
            isSelected={coin.name === fiatCurrency}
            onCurrencySelected={onClick}
            key={coin.name.toString()}
            showDivider={showDivider(index)}
          />
        ))}
      </Container>
      <BottomBar tab="settings" />
    </>
  );
}

export default FiatCurrencyScreen;
