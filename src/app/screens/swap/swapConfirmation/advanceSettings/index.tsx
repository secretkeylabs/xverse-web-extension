import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import TransactionSettingAlert from '@components/transactionSetting';
import { SwapConfirmationOutput } from '@screens/swap/swapConfirmation/useConfirmSwap';
import { setFee, setNonce } from '@secretkeylabs/xverse-core';
import { microstacksToStx, stxToMicrostacks } from '@secretkeylabs/xverse-core/currency';
import BigNumber from 'bignumber.js';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  width: '100%',
  marginTop: props.theme.spacing(10),
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

type Props = {
  swap: SwapConfirmationOutput;
};

export function AdvanceSettings({ swap }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [showFeeSettings, setShowFeeSettings] = useState(false);

  const onApplyClick = useCallback(({ fee, nonce }: { fee: string; nonce?: string }) => {
    const settingFee = BigInt(stxToMicrostacks(new BigNumber(fee) as any).toString());
    swap.onFeeUpdate(settingFee);
    if (nonce != null) {
      swap.unsignedTx.setNonce(BigInt(nonce));
    }
    setShowModal(false);
  }, []);
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_CONFIRM_SCREEN' });
  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        <>
          <ButtonImage src={SettingIcon} />
          <ButtonText>{t('ADVANCED_SETTING')}</ButtonText>
        </>
      </Button>
      <TransactionSettingAlert
        visible={showModal}
        fee={microstacksToStx(
          new BigNumber(
            (swap.unsignedTx.auth?.spendingCondition?.fee ?? BigInt(0)).toString(),
          ) as any,
        ).toString()}
        type="STX"
        nonce={(swap.unsignedTx.auth?.spendingCondition?.nonce ?? BigInt(0)).toString()}
        onCrossClick={() => {
          setShowModal(false);
          setShowFeeSettings(false);
        }}
        onApplyClick={onApplyClick}
        showFeeSettings={showFeeSettings}
        setShowFeeSettings={setShowFeeSettings}
      />
    </>
  );
}
export default AdvanceSettings;
