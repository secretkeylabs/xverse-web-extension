import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useGetBrc20FungibleTokens } from '@hooks/queries/ordinals/useGetBrc20FungibleTokens';
import { useGetSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useWalletSelector from '@hooks/useWalletSelector';
import { Container, Title } from '@screens/settings/index.styles';
import type { SupportedCurrency } from '@secretkeylabs/xverse-core';
import { ChangeFiatCurrencyAction } from '@stores/wallet/actions/actionCreators';
import { currencyList } from '@utils/currency';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CurrencyRow from './currencyRow';

function FiatCurrencyScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const { fiatCurrency } = useWalletSelector();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useGetSip10FungibleTokens();
  useGetBrc20FungibleTokens();

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const handleCurrencyClick = (currency: SupportedCurrency) => {
    dispatch(ChangeFiatCurrencyAction(currency));
    navigate(-1);
  };

  function showDivider(index: number): boolean {
    return !(index === currencyList.length - 1);
  }

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <Title>{t('CURRENCY')}</Title>
        {currencyList.map((coin, index) => (
          <CurrencyRow
            currency={coin}
            isSelected={coin.name === fiatCurrency}
            onCurrencySelected={handleCurrencyClick}
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
