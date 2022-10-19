import BottomModal from '@components/bottomModal';
import TokenTile from '@components/tokenTile';
import { FungibleToken } from '@secretkeylabs/xverse-core/types';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import IconStacks from '@assets/img/dashboard/stack_icon.svg';
import { useTranslation } from 'react-i18next';
import Theme from 'theme';

interface Props {
  visible: boolean;
  coins: FungibleToken[];
  title: string;
  onSelectBitcoin?: () => void;
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

  function renderFixedCoins() {
    return (
      <>
        <TokenTile
          title={t('BITCOIN')}
          currency="BTC"
          icon={IconBitcoin}
          underlayColor={Theme.colors.background.elevation2}
          margin={2}
          onPress={() => {
            onSelectBitcoin();
            onClose();
          }}
        />

        <TokenTile
          title={t('STACKS')}
          currency="STX"
          icon={IconStacks}
          underlayColor={Theme.colors.background.elevation2}
          margin={2}
          onPress={() => {
            onSelectStacks();
            onClose();
          }}
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
            underlayColor={Theme.colors.background.elevation2}
            margin={2}
            onPress={() => {
              onSelectCoin(coin);
              onClose();
            }}
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
