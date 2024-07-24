import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { ArrowDown } from '@phosphor-icons/react';
import CoinSelectModal from '@screens/home/coinSelectModal';
import { SwapInfoBlock } from '@screens/swap/swapInfoBlock';
import SwapTokenBlock from '@screens/swap/swapTokenBlock';
import { useSwap } from '@screens/swap/useSwap';
import Button from '@ui-library/button';
import { isFungibleToken } from '@utils/helper';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  row-gap: 16px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  margin-left: 5%;
  margin-right: 5%;
  padding-bottom: 16px;
`;

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: props.theme.spacing(8),
  marginTop: props.theme.spacing(16),
}));

const DownArrowButton = styled.button((props) => ({
  alignSelf: 'center',
  borderRadius: props.theme.radius(2),
  width: props.theme.spacing(18),
  height: props.theme.spacing(18),
  background: props.theme.colors.elevation3,
  transition: 'all 0.2s ease',
  ':hover': {
    opacity: 0.8,
  },
}));

const SendButtonContainer = styled.div((props) => ({
  paddingBottom: props.theme.spacing(12),
  paddingTop: props.theme.spacing(4),
  marginLeft: '5%',
  marginRight: '5%',
}));

function SwapStacksScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const swap = useSwap();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const defaultFrom = params.get('from');

  const [selecting, setSelecting] = useState<'from' | 'to'>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      !swap.selectedFromToken &&
      !swap.selectedToToken &&
      defaultFrom &&
      (defaultFrom === 'STX' || isFungibleToken(defaultFrom))
    ) {
      swap.onSelectToken(defaultFrom, 'from');
    }
  }, [defaultFrom, swap]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleClickContinue = useCallback(async () => {
    if (swap.submitError || !swap.onSwap) {
      return;
    }
    try {
      setLoading(true);
      await swap.onSwap();
    } finally {
      setLoading(false);
    }
  }, [swap, setLoading]);

  return (
    <>
      <TopRow title={t('SWAP')} onClick={handleGoBack} />
      <ScrollContainer>
        <Container>
          <SwapTokenBlock
            title={t('CONVERT')}
            selectedCoin={swap.selectedFromToken}
            amount={swap.inputAmount}
            error={swap.inputAmountInvalid}
            onAmountChange={swap.onInputAmountChanged}
            onSelectCoin={() => setSelecting('from')}
          />
          <DownArrowButton data-testid="down-arrow-button" onClick={swap.handleClickDownArrow}>
            <ArrowDown size={20} weight="regular" color="white" />
          </DownArrowButton>
          <SwapTokenBlock
            title={t('TO')}
            selectedCoin={swap.selectedToToken}
            onSelectCoin={() => setSelecting('to')}
          />
        </Container>
        <SwapInfoBlock swap={swap} />
      </ScrollContainer>
      {selecting != null && (
        <CoinSelectModal
          onSelectStacks={() => {
            swap.onSelectToken('STX', selecting);
          }}
          onClose={() => setSelecting(undefined)}
          onSelectCoin={(coin) => {
            swap.onSelectToken(coin, selecting);
          }}
          visible={!!selecting}
          coins={swap.coinsList}
          title={selecting === 'from' ? t('ASSET_TO_CONVERT_FROM') : t('ASSET_TO_CONVERT_TO')}
          loadingWalletData={swap.isLoadingWalletData}
        />
      )}
      <SendButtonContainer>
        <Button
          disabled={!!swap.submitError || swap.onSwap == null}
          variant={swap.submitError ? 'danger' : 'primary'}
          title={swap.submitError ?? t('CONTINUE')}
          loading={loading || swap.isLoadingRates}
          onClick={handleClickContinue}
        />
      </SendButtonContainer>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SwapStacksScreen;
