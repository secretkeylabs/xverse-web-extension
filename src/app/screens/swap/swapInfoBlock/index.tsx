import ChevronIcon from '@assets/img/swap/chevron.svg';
import SlippageEditIcon from '@assets/img/swap/slippageEdit.svg';
import BottomModal from '@components/bottomModal';
import { SlippageModalContent } from '@screens/swap/slippageModal';
import { UseSwap } from '@screens/swap/useSwap';
import { SUPPORT_URL_TAB_TARGET, SWAP_SPONSOR_DISABLED_SUPPORT_URL } from '@utils/constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Switch from 'react-switch';
import styled, { useTheme } from 'styled-components';

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

const ChevronImage = styled.img<{ rotated: boolean }>(({ rotated }) => ({
  transform: `rotate(${rotated ? 180 : 0}deg)`,
  transition: 'transform 0.1s ease-in-out',
}));

const SlippageImg = styled.img(() => ({
  width: 16,
  height: 16,
}));

const CannotBeSponsored = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['200'],
}));

const SponsorTransactionSwitchLabel = styled(DT)<{ disabled: boolean }>((props) => ({
  color: props.disabled ? props.theme.colors.white['400'] : props.theme.colors.white['200'],
}));

const ToggleContainer = styled(DD)({
  flex: 0,
});

const LearnMoreAnchor = styled.a((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['0'],
  marginTop: props.theme.spacing(2),
  display: 'block',
}));

export function SwapInfoBlock({ swap }: { swap: UseSwap }) {
  const [expandDetail, setExpandDetail] = useState(false);
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const [showSlippageModal, setShowSlippageModal] = useState(false);
  const theme = useTheme();

  return (
    <>
      <DL>
        <DT>
          <DetailButton onClick={() => setExpandDetail(!expandDetail)}>
            {t('DETAILS')}
            <ChevronImage alt={t('DETAILS')} src={ChevronIcon} rotated={expandDetail} />
          </DetailButton>
        </DT>
        <DD>{swap.swapInfo?.exchangeRate ?? '--'}</DD>
        {expandDetail && (
          <>
            <DT>{t('MIN_RECEIVE')}</DT>
            <DD>{swap.minReceived ?? '--'}</DD>
            <DT>{t('SLIPPAGE')}</DT>
            <DD>
              <DetailButton onClick={() => setShowSlippageModal(true)}>
                {swap.slippage * 100}%
                <SlippageImg alt={t('SLIPPAGE')} src={SlippageEditIcon} />
              </DetailButton>
            </DD>
            <DT>{t('LP_FEE')}</DT>
            <DD>{swap.swapInfo?.lpFee ?? '--'}</DD>
            <DT>{t('ROUTE')}</DT>
            <DD>{swap.swapInfo?.route ?? '--'}</DD>
            {swap.isServiceRunning && (
              <>
                <>
                  <SponsorTransactionSwitchLabel disabled={swap.isSponsorDisabled}>
                    {t('SPONSOR_TRANSACTION')}
                  </SponsorTransactionSwitchLabel>
                  <ToggleContainer>
                    <CustomSwitch
                      onColor={theme.colors.orange_main}
                      offColor={theme.colors.background.elevation3}
                      onChange={swap.handleChangeUserOverrideSponsorValue}
                      checked={swap.isSponsored}
                      disabled={swap.isSponsorDisabled}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      height={19}
                      width={36}
                    />
                  </ToggleContainer>
                </>
                {swap.isSponsorDisabled && (
                  <div>
                    <CannotBeSponsored>
                      {t('SWAP_TRANSACTION_CANNOT_BE_SPONSORED')}
                    </CannotBeSponsored>
                    <LearnMoreAnchor
                      href={SWAP_SPONSOR_DISABLED_SUPPORT_URL}
                      target={SUPPORT_URL_TAB_TARGET}
                      rel="noopener noreferrer"
                    >
                      {t('LEARN_MORE')}
                      {' →'}
                    </LearnMoreAnchor>
                  </div>
                )}
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
export default SwapInfoBlock;
