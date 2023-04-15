import { useNavigate } from 'react-router-dom';
import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import BottomBar from '@components/tabBar';
import SwapTokenBlock from '@screens/swap/swapTokenBlock';
import ArrowDown from '@assets/img/swap/arrow_swap.svg';
import useCoinsData from '@hooks/queries/useCoinData';
import useWalletSelector from '@hooks/useWalletSelector';
import { useSwap } from '@screens/swap/useSwap';
import { useState } from 'react';
import { SwapInfoBlock } from '@screens/swap/swapInfoBlock';
import ActionButton from '@components/button';
import CoinSelectModal from '@screens/home/coinSelectModal';

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

const DownArrow = styled.img((props) => ({
  alignSelf: 'center',
  width: props.theme.spacing(18),
  height: props.theme.spacing(18),
}));

interface ButtonProps {
  enabled: boolean;
}

const SendButtonContainer = styled.div<ButtonProps>((props) => ({
  paddingBottom: props.theme.spacing(12),
  paddingTop: props.theme.spacing(4),
  marginLeft: '5%',
  marginRight: '5%',
  opacity: props.enabled ? 1 : 0.6,
}));

function SwapScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const swap = useSwap();

  const [selecting, setSelecting] = useState<'from' | 'to'>();

  return (
    <>
      <TopRow title={t('SWAP')} onClick={() => navigate('/')} />
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
          <DownArrow src={ArrowDown} />
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
          onSelectBitcoin={() => null}
          onSelectStacks={() => {
            if (selecting === 'from') {
              swap.onSelectFromToken('STX');
            } else {
              swap.onSelectToToken('STX');
            }
          }}
          onClose={() => setSelecting(undefined)}
          onSelectCoin={(coin) => {
            if (selecting === 'from') {
              swap.onSelectFromToken(coin);
            } else {
              swap.onSelectToToken(coin);
            }
          }}
          visible={!!selecting}
          coins={swap.coinsList}
          title={selecting === 'from' ? t('FROM') : t('TO')}
          loadingWalletData={swap.isLoadingWalletData}
        />
      )}
      <SendButtonContainer enabled={!swap.submitError}>
        <ActionButton
          text={t('CONTINUE')}
          onPress={() => {
            alert('test');
          }}
        />
      </SendButtonContainer>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SwapScreen;
