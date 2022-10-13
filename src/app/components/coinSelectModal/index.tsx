import BottomModal from '@components/bottomModal';
import TokenTile from '@components/tokenTile';
import { FungibleToken } from '@secretkeylabs/xverse-core/types';
import BigNumber from 'bignumber.js';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import IconStacks from '@assets/img/dashboard/stack_icon.svg';
import { useTranslation } from 'react-i18next';
import Theme from 'theme';
import { useEffect, useRef } from 'react';

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
          currency={'BTC'}
          icon={IconBitcoin}
          underlayColor={Theme.colors.background.elevation2}
          margin={2}
          onPress={() => {
            onSelectBitcoin();
            onClose();
          }}
          stxBalance={new BigNumber(103)}
          btcBalance={new BigNumber(210)}
          stxBtcRate={new BigNumber(0.00001736)}
          btcFiatRate={new BigNumber(18816.8499999925912416)}
          loadingWalletData={false}
          initializedStxData={true}
          initializedFtData={true}
          initializedData={true}
        />

        <TokenTile
          title={t('STACKS')}
          currency={'STX'}
          icon={IconStacks}
          underlayColor={Theme.colors.background.elevation2}
          margin={2}
          onPress={() => {
            onSelectStacks();
            onClose();
          }}
          stxBalance={new BigNumber(103)}
          btcBalance={new BigNumber(0.0002)}
          stxBtcRate={new BigNumber(0.00001736)}
          btcFiatRate={new BigNumber(18816.8499999925912416)}
          loadingWalletData={false}
          initializedStxData={true}
          initializedFtData={true}
          initializedData={true}
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
            currency={'FT'}
            icon={IconStacks}
            underlayColor={Theme.colors.background.elevation2}
            margin={2}
            onPress={() => {
              onSelectCoin(coin);
              onClose();
            }}
            fungibleToken={coin}
            stxBalance={new BigNumber(103)}
            btcBalance={new BigNumber(0.0002)}
            stxBtcRate={new BigNumber(0.00001736)}
            btcFiatRate={new BigNumber(18816.8499999925912416)}
            loadingWalletData={false}
            initializedStxData={true}
            initializedFtData={true}
            initializedData={true}
          />
        ))}
      </>
    );
  }
  return (
 
 
    <BottomModal visible={visible} header={title} onClose={onClose} >
      {renderToken()}
    </BottomModal>

  );
}

export default CoinSelectModal;
