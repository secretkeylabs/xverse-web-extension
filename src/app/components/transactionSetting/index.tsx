/* eslint-disable no-nested-ternary */
import BottomModal from '@components/bottomModal';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ArrowIcon from '@assets/img/settings/arrow.svg';
import ActionButton from '@components/button';
import { stxToMicrostacks } from '@secretkeylabs/xverse-core/currency';
import { useSelector } from 'react-redux';
import { StoreState } from '@stores/index';
import { isCustomFeesAllowed, Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import { BtcUtxoDataResponse, UTXO } from '@secretkeylabs/xverse-core';
import EditNonce from './editNonce';
import EditFee from './editFee';

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(10),
  marginBottom: props.theme.spacing(20),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const TransactionSettingOptionText = styled.h1((props) => ({
  ...props.theme.body_medium_l,
  color: props.theme.colors.white[200],
}));

const TransactionSettingOptionButton = styled.button((props) => ({
  background: 'transparent',
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  marginTop: props.theme.spacing(16),
  marginBottom: props.theme.spacing(16),
  paddingLeft: props.theme.spacing(12),
  paddingRight: props.theme.spacing(12),
  justifyContent: 'space-between',
}));

const TransactionSettingNonceOptionButton = styled.button((props) => ({
  background: 'transparent',
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  marginBottom: props.theme.spacing(20),
  paddingLeft: props.theme.spacing(12),
  paddingRight: props.theme.spacing(12),
  justifyContent: 'space-between',
}));

interface Props {
  visible: boolean;
  fee: string;
  feePerVByte?: BigNumber;
  loading?: boolean;
  nonce?: string;
  onApplyClick: (params: { fee: string; feeRate?: string; nonce?: string }) => void;
  onCrossClick: () => void;
  type?: TxType;
  btcRecipients?: Recipient[];
  ordinalTxUtxo?: UTXO;
  isRestoreFlow?: boolean;
  nonOrdinalUtxos?: BtcUtxoDataResponse[];
  showFeeSettings: boolean;
  setShowFeeSettings: (value: boolean) => void;
}
type TxType = 'STX' | 'BTC' | 'Ordinals';

function TransactionSettingAlert({
  visible,
  fee,
  feePerVByte,
  loading,
  nonce,
  onApplyClick,
  onCrossClick,
  type = 'STX',
  btcRecipients,
  ordinalTxUtxo,
  isRestoreFlow,
  nonOrdinalUtxos,
  showFeeSettings,
  setShowFeeSettings,
}: Props) {
  const { t } = useTranslation('translation');
  const [feeInput, setFeeInput] = useState(fee);
  const [feeRate, setFeeRate] = useState<BigNumber | string | undefined>(feePerVByte);
  const [nonceInput, setNonceInput] = useState<string | undefined>(nonce);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('standard');
  const [showNonceSettings, setShowNonceSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(loading);
  const { btcBalance, stxAvailableBalance } = useSelector((state: StoreState) => state.walletState);

  function applyClickForStx() {
    if (stxAvailableBalance) {
      const currentFee = stxToMicrostacks(new BigNumber(feeInput));
      if (currentFee.gt(stxAvailableBalance)) {
        setError(t('TRANSACTION_SETTING.GREATER_FEE_ERROR'));
        return;
      }
    }
    setShowNonceSettings(false);
    setShowFeeSettings(false);
    setError('');
    onApplyClick({ fee: feeInput.toString(), nonce: nonceInput });
  }

  async function applyClickForBtc() {
    const currentFee = new BigNumber(feeInput);
    if (btcBalance && currentFee.gt(btcBalance)) {
      // show fee exceeds total balance error
      setError(t('TRANSACTION_SETTING.GREATER_FEE_ERROR'));
      return;
    }
    if (selectedOption === 'custom') {
      const response = await isCustomFeesAllowed(feeInput.toString());
      if (!response) {
        setError(t('TRANSACTION_SETTING.LOWER_THAN_MINIMUM'));
        return;
      }
    }
    setShowNonceSettings(false);
    setShowFeeSettings(false);
    setError('');
    onApplyClick({ fee: feeInput.toString(), feeRate: feeRate?.toString() });
  }

  const onEditFeesPress = () => {
    setShowFeeSettings(true);
  };

  const onEditNoncePress = () => {
    setShowNonceSettings(true);
  };

  const onLoading = () => {
    setIsLoading(true);
  };

  const onComplete = () => {
    setIsLoading(false);
  };

  const onClosePress = () => {
    setShowNonceSettings(false);
    setShowFeeSettings(false);
    onCrossClick();
  };

  const renderContent = () => {
    if (showNonceSettings) {
      return <EditNonce nonce={nonce!} setNonce={setNonceInput} />;
    }

    if (showFeeSettings) {
      return (
        <EditFee
          fee={fee}
          feeRate={feeRate}
          type={type}
          error={error}
          setIsLoading={onLoading}
          setIsNotLoading={onComplete}
          setFee={setFeeInput}
          setFeeRate={setFeeRate}
          setError={setError}
          setFeeMode={setSelectedOption}
          btcRecipients={btcRecipients}
          ordinalTxUtxo={ordinalTxUtxo}
          isRestoreFlow={isRestoreFlow}
          nonOrdinalUtxos={nonOrdinalUtxos}
        />
      );
    }

    return (
      <>
        <TransactionSettingOptionButton onClick={onEditFeesPress}>
          <TransactionSettingOptionText>
            {t('TRANSACTION_SETTING.ADVANCED_SETTING_FEE_OPTION')}
          </TransactionSettingOptionText>
          <img src={ArrowIcon} alt="Arrow " />
        </TransactionSettingOptionButton>
        {type === 'STX' && (
          <TransactionSettingNonceOptionButton onClick={onEditNoncePress}>
            <TransactionSettingOptionText>
              {t('TRANSACTION_SETTING.ADVANCED_SETTING_NONCE_OPTION')}
            </TransactionSettingOptionText>
            <img src={ArrowIcon} alt="Arrow " />
          </TransactionSettingNonceOptionButton>
        )}
      </>
    );
  };

  return (
    <BottomModal
      visible={visible}
      header={
        showFeeSettings
          ? t('TRANSACTION_SETTING.ADVANCED_SETTING_FEE_OPTION')
          : showNonceSettings
          ? t('TRANSACTION_SETTING.ADVANCED_SETTING_NONCE_OPTION')
          : t('TRANSACTION_SETTING.ADVANCED_SETTING')
      }
      onClose={onClosePress}
    >
      {renderContent()}
      {(showFeeSettings || showNonceSettings) && (
        <ButtonContainer>
          <ActionButton
            text={t('TRANSACTION_SETTING.APPLY')}
            processing={isLoading}
            disabled={isLoading || !!error}
            onPress={type === 'STX' ? applyClickForStx : applyClickForBtc}
          />
        </ButtonContainer>
      )}
    </BottomModal>
  );
}

export default TransactionSettingAlert;
