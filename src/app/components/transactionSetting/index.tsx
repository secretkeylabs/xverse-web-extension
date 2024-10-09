import ArrowIcon from '@assets/img/settings/arrow.svg';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import { stxToMicrostacks } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Sheet from '@ui-library/sheet';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
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

type Props = {
  visible: boolean;
  fee: string;
  loading?: boolean;
  nonce?: string;
  onApplyClick: (params: { fee: string; feeRate?: string; nonce?: string }) => void;
  onCrossClick: () => void;
  showFeeSettings: boolean;
  nonceSettings?: boolean;
  setShowFeeSettings: (value: boolean) => void;
};

function TransactionSettingAlert({
  visible,
  fee,
  loading,
  nonce,
  onApplyClick,
  onCrossClick,
  showFeeSettings,
  nonceSettings = false,
  setShowFeeSettings,
}: Props) {
  const { t } = useTranslation('translation');
  const [feeInput, setFeeInput] = useState(fee);
  const [feeRate, setFeeRate] = useState<BigNumber | string | undefined>();
  const [nonceInput, setNonceInput] = useState<string | undefined>(nonce);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('medium');
  const [showNonceSettings, setShowNonceSettings] = useState(false);
  const { data: stxData } = useStxWalletData();

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

  const onEditFeesPress = () => {
    setShowFeeSettings(true);
  };

  const onEditNoncePress = () => {
    setShowNonceSettings(true);
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
      return (
        <EditStxFee
          fee={fee}
          feeRate={feeRate}
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
      <>
        <TransactionSettingOptionButton onClick={onEditFeesPress}>
          <TransactionSettingOptionText>
            {t('TRANSACTION_SETTING.ADVANCED_SETTING_FEE_OPTION')}
          </TransactionSettingOptionText>
          <img src={ArrowIcon} alt="Arrow" />
        </TransactionSettingOptionButton>
        <TransactionSettingNonceOptionButton onClick={onEditNoncePress}>
          <TransactionSettingOptionText>
            {t('TRANSACTION_SETTING.ADVANCED_SETTING_NONCE_OPTION')}
          </TransactionSettingOptionText>
          <img src={ArrowIcon} alt="Arrow" />
        </TransactionSettingNonceOptionButton>
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
      {(showFeeSettings || showNonceSettings || nonceSettings) && (
        <ButtonsContainer>
          <Button
            title={t('TRANSACTION_SETTING.BACK')}
            onClick={onClosePress}
            variant="secondary"
          />
          <Button
            title={t('TRANSACTION_SETTING.APPLY')}
            onClick={showNonceSettings || nonceSettings ? applyClickForNonceStx : applyClickForStx}
            loading={loading}
            disabled={loading || !!error}
          />
        </ButtonsContainer>
      )}
    </Sheet>
  );
}

export default TransactionSettingAlert;
