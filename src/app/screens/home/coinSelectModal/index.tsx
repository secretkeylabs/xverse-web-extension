import BottomModal from '@components/bottomModal';
import TokenTile from '@components/tokenTile';
import useWalletSelector from '@hooks/useWalletSelector';
import type { FungibleToken } from '@secretkeylabs/xverse-core';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

const Container = styled.div((props) => ({
  marginTop: props.theme.spacing(6),
  marginBottom: props.theme.spacing(20),
}));

interface Props {
  visible: boolean;
  coins: FungibleToken[];
  title: string;
  onSelectBitcoin?: () => void;
  onSelectStacks?: () => void;
  onSelectCoin: (coin: FungibleToken) => void;
  onClose: () => void;
  loadingWalletData: boolean;
}

function CoinSelectModal({
  visible,
  coins,
  title,
  onSelectBitcoin,
  onSelectStacks,
  onSelectCoin,
  onClose,
  loadingWalletData,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const theme = useTheme();
  const { btcAddress, stxAddress, hideStx } = useWalletSelector();
  const handleOnBitcoinPress = () => {
    onSelectBitcoin?.();
    onClose();
  };

  const handleOnStackPress = () => {
    onSelectStacks?.();
    onClose();
  };

  function renderFixedCoins() {
    return (
      <>
        {btcAddress && onSelectBitcoin != null && (
          <TokenTile
            title={t('BITCOIN')}
            currency="BTC"
            loading={loadingWalletData}
            underlayColor={theme.colors.elevation2}
            margin={14}
            enlargeTicker
            onPress={handleOnBitcoinPress}
          />
        )}
        {stxAddress && !hideStx && (
          <TokenTile
            title={t('STACKS')}
            currency="STX"
            loading={loadingWalletData}
            underlayColor={theme.colors.elevation2}
            margin={14}
            enlargeTicker
            onPress={handleOnStackPress}
          />
        )}
      </>
    );
  }

  function renderToken() {
    return (
      <Container>
        {renderFixedCoins()}
        {stxAddress &&
          coins.map((coin) => (
            <TokenTile
              key={coin.principal}
              title={coin.name}
              currency="FT"
              loading={loadingWalletData}
              underlayColor={theme.colors.elevation2}
              margin={14}
              enlargeTicker
              onPress={() => {
                onSelectCoin(coin);
                onClose();
              }}
              fungibleToken={coin}
            />
          ))}
      </Container>
    );
  }
  return (
    <BottomModal visible={visible} header={title} onClose={onClose}>
      {renderToken()}
    </BottomModal>
  );
}

export default CoinSelectModal;
