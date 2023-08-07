import { UseSwap } from '@screens/swap/useSwap';
import { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import SlippageEditIcon from '@assets/img/swap/slippageEdit.svg';
import ChevronIcon from '@assets/img/swap/chevron.svg';
import BottomModal from '@components/bottomModal';
import { SlippageModalContent } from '@screens/swap/slippageModal';
import Switch from 'react-switch';

const CustomSwitch = styled(Switch)`
  .react-switch-handle {
    background-color: ${({ checked }) =>
      checked ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)'} !important;
    border: ${({ checked }) => (checked ? '' : '4px solid rgba(255, 255, 255, 0.2)')} !important;
    height: 16px !important;
    width: 16px !important;
  }
`;

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

const DL = styled.dl((props) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  rowGap: props.theme.spacing(8),
}));

const DT = styled.dt((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['200'],
  flex: '50%',
}));

const DD = styled.dd((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['0'],
  flex: '50%',
  display: 'flex',
  justifyContent: 'flex-end',
  textAlign: 'right',
}));

const ToggleContainer = styled.div({
  flex: '30%',
  display: 'flex',
  justifyContent: 'flex-end',
});

export function SwapInfoBlock({ swap }: { swap: UseSwap }) {
  const [expandDetail, setExpandDetail] = useState(false);
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const [showSlippageModal, setShowSlippageModal] = useState(false);
  const theme = useTheme();

  const toggleFunction = () => {
    swap.setIsSponsorOptionSelected(!swap.isSponsored);
  };

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
        <DD>{swap.swapInfo?.exchangeRate ?? '--'}</DD>
        {expandDetail && (
          <>
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
            {swap.isServiceRunning && (
              <>
                <DT>{t('SPONSOR_TRANSACTION')}</DT>
                <ToggleContainer>
                  <CustomSwitch
                    onColor={theme.colors.purple_main}
                    offColor={theme.colors.background.elevation3}
                    onChange={toggleFunction}
                    checked={swap.isSponsored}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={19}
                    width={36}
                  />
                </ToggleContainer>
              </>
            )}
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
