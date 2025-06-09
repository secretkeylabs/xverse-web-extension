import TokenTile from '@components/tokenTile';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import type { FungibleToken } from '@secretkeylabs/xverse-core';
import Sheet from '@ui-library/sheet';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  marginTop: props.theme.spacing(6),
  marginBottom: props.theme.spacing(20),
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.xl,
}));

const StyledTokenTile = styled(TokenTile)`
  padding: 0;
  background-color: transparent;
`;

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
  const selectedAccount = useSelectedAccount();
  const { btcAddress, stxAddress } = selectedAccount;
  const { hideStx } = useWalletSelector();
  const handleOnBitcoinPress = () => {
    onSelectBitcoin?.();
    onClose();
  };

  const handleOnStackPress = () => {
    onSelectStacks?.();
    onClose();
  };

  return (
    <Sheet visible={visible} title={title} onClose={onClose}>
      <Container>
        {btcAddress && onSelectBitcoin != null && (
          <StyledTokenTile
            title={t('BITCOIN')}
            currency="BTC"
            loading={loadingWalletData}
            onPress={handleOnBitcoinPress}
            hidePriceChange
          />
        )}
        {stxAddress && !hideStx && (
          <StyledTokenTile
            title={t('STACKS')}
            currency="STX"
            loading={loadingWalletData}
            onPress={handleOnStackPress}
            hidePriceChange
          />
        )}
        {coins.map((coin) => (
          <StyledTokenTile
            key={coin.principal}
            title={coin.name}
            currency="FT"
            loading={loadingWalletData}
            onPress={() => {
              onSelectCoin(coin);
              onClose();
            }}
            fungibleToken={coin}
            showProtocolIcon={false}
            hidePriceChange
          />
        ))}
      </Container>
    </Sheet>
  );
}

export default CoinSelectModal;
