import ArrowIcon from '@assets/img/settings/arrow.svg';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  isCustomFeesAllowed,
  stxToMicrostacks,
  type Recipient,
  type UTXO,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Sheet from '@ui-library/sheet';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import EditBtcFee from './editBtcFee';
import EditNonce from './editNonce';
import EditStxFee from './editStxFee';

const ButtonsContainer = styled.div`
  display: flex;
  column-gap: ${(props) => props.theme.space.s};
  margin-top: ${(props) => props.theme.space.l};
  margin-bottom: ${(props) => props.theme.space.xxl};
`;

const TransactionSettingOptionText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_l,
  color: props.theme.colors.white_200,
}));

const TransactionSettingOptionButton = styled.button((props) => ({
  background: 'transparent',
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  marginTop: props.theme.spacing(16),
  marginBottom: props.theme.spacing(16),
  justifyContent: 'space-between',
}));

const TransactionSettingNonceOptionButton = styled.button((props) => ({
  background: 'transparent',
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  marginBottom: props.theme.spacing(20),
  justifyContent: 'space-between',
}));

type TxType = 'STX' | 'BTC' | 'Ordinals';

type Props = {
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
  nonOrdinalUtxos?: UTXO[];
  showFeeSettings: boolean;
  nonceSettings?: boolean;
  setShowFeeSettings: (value: boolean) => void;
};

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
  nonceSettings = false,
  setShowFeeSettings,
}: Props) {
  const { t } = useTranslation('translation');
  const [feeInput, setFeeInput] = useState(fee);
  const [feeRate, setFeeRate] = useState<BigNumber | string | undefined>(feePerVByte);
  const [nonceInput, setNonceInput] = useState<string | undefined>(nonce);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('medium');
  const [showNonceSettings, setShowNonceSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(loading);
  const [customFeeSelected, setCustomFeeSelected] = useState(false);
  const { network } = useWalletSelector();
  const { data: stxData } = useStxWalletData();
  const { data: btcBalance } = useBtcWalletData();

  const applyClickForStx = () => {
    if (stxData?.availableBalance) {
      const currentFee = stxToMicrostacks(new BigNumber(feeInput));
      if (currentFee.gt(stxData.availableBalance)) {
        setError(t('TRANSACTION_SETTING.GREATER_FEE_ERROR'));
        return;
      }
      if (currentFee.lte(new BigNumber(0))) {
        setError(t('TRANSACTION_SETTING.LOWER_THAN_MINIMUM'));
        return;
      }

      try {
        // `setFee` method from `@secretkeylabs/xverse-core` requires a BigInt so we should check if it is a valid BigInt
        BigInt(currentFee.toString());
      } catch (e) {
        setError(t('TRANSACTION_SETTING.LOWER_THAN_MINIMUM'));
        return;
      }
    }
    setShowFeeSettings(false);
    setError('');
    onApplyClick({ fee: feeInput.toString(), nonce: nonceInput });
  };

  const applyClickForNonceStx = () => {
    setShowNonceSettings(false);
    setError('');
    onApplyClick({ fee: feeInput.toString(), nonce: nonceInput });
  };

  const applyClickForBtc = async () => {
    const currentFee = new BigNumber(feeInput);
    if (currentFee.gt(btcBalance ?? 0)) {
      // show fee exceeds total balance error
      setError(t('TRANSACTION_SETTING.GREATER_FEE_ERROR'));
      return;
    }
    if (selectedOption === 'custom' && feeRate) {
      const response = await isCustomFeesAllowed(network.type, feeRate.toString());
      if (!response) {
        setError(t('TRANSACTION_SETTING.LOWER_THAN_MINIMUM'));
        return;
      }
    }
    setShowNonceSettings(false);
    setShowFeeSettings(false);
    setCustomFeeSelected(false);
    setError('');
    onApplyClick({ fee: feeInput.toString(), feeRate: feeRate?.toString() });
  };

  const btcFeeOptionSelected = async (selectedFeeRate: string, totalFee: string) => {
    const currentFee = new BigNumber(feeInput);
    if (currentFee.gt(btcBalance ?? 0)) {
      // show fee exceeds total balance error
      setError(t('TRANSACTION_SETTING.GREATER_FEE_ERROR'));
      return;
    }
    setShowNonceSettings(false);
    setShowFeeSettings(false);
    setError('');
    onApplyClick({ fee: totalFee, feeRate: selectedFeeRate });
  };

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
    if (showNonceSettings || nonceSettings) {
      return <EditNonce nonce={nonce!} setNonce={setNonceInput} />;
    }

    if (showFeeSettings) {
      if (type === 'STX') {
        return (
          <EditStxFee
            fee={fee}
            feeRate={feeRate}
            type={type}
            error={error}
            setFee={setFeeInput}
            setFeeRate={setFeeRate}
            setError={setError}
            feeMode={selectedOption}
            setFeeMode={setSelectedOption}
          />
        );
      }
      return (
        <EditBtcFee
          fee={fee}
          feeRate={feeRate}
          type={type}
          error={error}
          setIsLoading={onLoading}
          setIsNotLoading={onComplete}
          setFee={setFeeInput}
          setFeeRate={setFeeRate}
          setError={setError}
          feeMode={selectedOption}
          setFeeMode={setSelectedOption}
          btcRecipients={btcRecipients}
          ordinalTxUtxo={ordinalTxUtxo}
          isRestoreFlow={isRestoreFlow}
          nonOrdinalUtxos={nonOrdinalUtxos}
          setCustomFeeSelected={(selected: boolean) => {
            setCustomFeeSelected(selected);
          }}
          customFeeSelected={customFeeSelected}
          feeOptionSelected={btcFeeOptionSelected}
        />
      );
    }

    return (
      <>
        <TransactionSettingOptionButton onClick={onEditFeesPress}>
          <TransactionSettingOptionText>
            {t('TRANSACTION_SETTING.ADVANCED_SETTING_FEE_OPTION')}
          </TransactionSettingOptionText>
          <img src={ArrowIcon} alt="Arrow" />
        </TransactionSettingOptionButton>
        {type === 'STX' && (
          <TransactionSettingNonceOptionButton onClick={onEditNoncePress}>
            <TransactionSettingOptionText>
              {t('TRANSACTION_SETTING.ADVANCED_SETTING_NONCE_OPTION')}
            </TransactionSettingOptionText>
            <img src={ArrowIcon} alt="Arrow" />
          </TransactionSettingNonceOptionButton>
        )}
      </>
    );
  };

  return (
    <Sheet
      visible={visible}
      title={
        showNonceSettings || nonceSettings
          ? t('TRANSACTION_SETTING.ADVANCED_SETTING_NONCE_OPTION')
          : showFeeSettings
          ? t('TRANSACTION_SETTING.ADVANCED_SETTING_FEE_OPTION')
          : t('TRANSACTION_SETTING.ADVANCED_SETTING')
      }
      onClose={onClosePress}
    >
      {renderContent()}
      {type === 'STX' && (showFeeSettings || showNonceSettings || nonceSettings) && (
        <ButtonsContainer>
          <Button title="Back" onClick={onClosePress} variant="secondary" />
          <Button
            title={t('TRANSACTION_SETTING.APPLY')}
            onClick={showNonceSettings || nonceSettings ? applyClickForNonceStx : applyClickForStx}
            loading={isLoading}
            disabled={isLoading || !!error}
          />
        </ButtonsContainer>
      )}
      {customFeeSelected && (
        <ButtonsContainer>
          <Button
            title="Back"
            onClick={() => {
              setCustomFeeSelected(false);
            }}
            variant="secondary"
          />
          <Button
            title={t('TRANSACTION_SETTING.APPLY')}
            onClick={applyClickForBtc}
            loading={isLoading}
            disabled={isLoading || !!error}
          />
        </ButtonsContainer>
      )}
    </Sheet>
  );
}

export default TransactionSettingAlert;
