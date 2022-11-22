import BottomModal from '@components/bottomModal';
import TokenTile from '@components/tokenTile';
import { FungibleToken } from '@secretkeylabs/xverse-core/types';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import IconStacks from '@assets/img/dashboard/stack_icon.svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { useSelector } from 'react-redux';
import { StoreState } from '@stores/index';

interface Props {
  visible: boolean;
  coins: FungibleToken[];
  title: string;
  onSelectBitcoin: () => void;
  onSelectStacks: () => void;
  onSelectCoin: (coin: FungibleToken) => void;
  onClose: () => void;
}

function CoinSelectModal({
  visible,
  coins,
  title,
  onSelectBitcoin,
  onSelectStacks,
  onSelectCoin,
  onClose,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const {
    loadingWalletData,
    loadingBtcData,
  } = useSelector((state: StoreState) => state.walletState);
  const theme = useTheme();

  const handleOnBitcoinPress = () => {
    onSelectBitcoin();
    onClose();
  };

  const handleOnStackPress = () => {
    onSelectStacks();
    onClose();
  };

  const handleOnCoinPress = (coin:FungibleToken) => {
    onSelectCoin(coin);
    onClose();
  };

  function renderFixedCoins() {
    return (
      <>
        <TokenTile
          title={t('BITCOIN')}
          currency="BTC"
          icon={IconBitcoin}
          loading={loadingBtcData}
          underlayColor={theme.colors.background.elevation2}
          margin={2}
          onPress={handleOnBitcoinPress}
        />

        <TokenTile
          title={t('STACKS')}
          currency="STX"
          icon={IconStacks}
          loading={loadingWalletData}
          underlayColor={theme.colors.background.elevation2}
          margin={2}
          onPress={handleOnStackPress}
        />
      </>
    );
  }

  function renderToken() {
    return (
      <>
        {renderFixedCoins()}
        {coins.map((coin) => (
          <TokenTile
            key={coin.principal}
            title={coin.name}
            currency="FT"
            icon={IconStacks}
            loading={loadingWalletData}
            underlayColor={theme.colors.background.elevation2}
            margin={2}
            onPress={handleOnCoinPress}
            fungibleToken={coin}
          />
        ))}
      </>
    );
  }
  return (
    <BottomModal visible={visible} header={title} onClose={onClose}>
      {renderToken()}
    </BottomModal>
  );
}

export default CoinSelectModal;
