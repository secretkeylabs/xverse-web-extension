import { useCallback, useState } from 'react';
import { microstacksToStx, stxToMicrostacks } from '@secretkeylabs/xverse-core/currency';
import TransactionSettingAlert from '@components/transactionSetting';
import BigNumber from 'bignumber.js';
import { setFee, setNonce } from '@secretkeylabs/xverse-core';
import { SwapConfirmationInput } from '@screens/swap/swapConfirmation/useConfirmSwap';
import styled from 'styled-components';
import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import { useTranslation } from 'react-i18next';

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
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

type Props = {
  swap: SwapConfirmationInput;
};

export function AdvanceSettings({ swap }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [showFeeSettings, setShowFeeSettings] = useState(false);

  const onApplyClick = useCallback((settingFee: string, nonce?: string) => {
    const fee = BigInt(stxToMicrostacks(new BigNumber(settingFee) as any).toString());
    swap.unsignedTx.setFee(fee);
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
            (swap.unsignedTx.auth?.spendingCondition?.fee ?? BigInt(0)).toString()
          ) as any
        ).toString()}
        type="STX"
        nonce={(swap.unsignedTx.auth?.spendingCondition?.nonce ?? BigInt(0)).toString()}
        onCrossClick={() => {setShowModal(false); setShowFeeSettings(false)}}
        onApplyClick={onApplyClick}
        showFeeSettings={showFeeSettings}
        setShowFeeSettings={setShowFeeSettings}
      />
    </>
  );
}
export default AdvanceSettings;
