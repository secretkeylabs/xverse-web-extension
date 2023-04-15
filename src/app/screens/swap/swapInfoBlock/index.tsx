import { UseSwap } from '@screens/swap/useSwap';
import { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import SlippageEditIcon from '@assets/img/swap/slippageEdit.svg';
import ChevronIcon from '@assets/img/swap/chevron.svg';
import BottomModal from '@components/bottomModal';
import { SlippageModalContent } from '@screens/swap/slippageModal';

const PoweredByAlexText = styled.span((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['400'],
}));

const DetailButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: props.theme.spacing(2),
  background: 'transparent',
  alignItems: 'center',
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['200'],
}));

const EditSlippageButton = styled.button((props) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  flexDirection: 'row',
  columnGap: props.theme.spacing(2),
  background: 'transparent',
  alignItems: 'center',
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['0'],
}));

const DL = styled.dl((props) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  rowGap: props.theme.spacing(4),
}));

const DT = styled.dt((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['200'],
  flex: '60%',
}));

const DD = styled.dd((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['0'],
  flex: '40%',
  display: 'flex',
  justifyContent: 'flex-end',
}));

export function SwapInfoBlock({ swap }: { swap: UseSwap }) {
  const [expandDetail, setExpandDetail] = useState(false);
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });

  const [showSlippageModal, setShowSlippageModal] = useState(false);

  return (
    <>
      <DL>
        <DT>
          <DetailButton onClick={() => setExpandDetail(!expandDetail)}>
            {t('DETAILS')}
            <img
              alt={t('DETAILS')}
              src={ChevronIcon}
              style={{
                transform: `rotate(${expandDetail ? 180 : 0}deg)`,
                transition: 'transform 0.1s ease-in-out',
              }}
            />
          </DetailButton>
        </DT>
        {expandDetail && (
          <>
            <DD>{swap.swapInfo?.exchangeRate ?? '--'}</DD>
            <DT>{t('MIN_RECEIVE')}</DT>
            <DD>{swap.minReceived ?? '--'}</DD>
            <DT>{t('SLIPPAGE')}</DT>
            <DD>
              <DetailButton
                style={{ alignItems: 'center', display: 'flex' }}
                onClick={() => setShowSlippageModal(true)}
              >
                {swap.slippage * 100}%
                <img alt={t('SLIPPAGE')} src={SlippageEditIcon} style={{ width: 16, height: 16 }} />
              </DetailButton>
            </DD>
            <DT>{t('LP_FEE')}</DT>
            <DD>{swap.swapInfo?.lpFee ?? '--'}</DD>
            <DT>{t('ROUTE')}</DT>
            <DD>{swap.swapInfo?.route ?? '--'}</DD>
          </>
        )}
      </DL>
      <PoweredByAlexText>{t('POWERED_BY_ALEX')}</PoweredByAlexText>
      <BottomModal
        header={t('SLIPPAGE_TITLE')}
        visible={showSlippageModal}
        onClose={() => setShowSlippageModal(false)}
      >
        <SlippageModalContent
          slippage={swap.slippage}
          onChange={(slippage) => {
            swap.onSlippageChanged(slippage);
            setShowSlippageModal(false);
          }}
        />
      </BottomModal>
    </>
  );
}
