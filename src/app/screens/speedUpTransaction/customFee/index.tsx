import BottomModal from '@components/bottomModal';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  getBtcFiatEquivalent,
  getStxFiatEquivalent,
  stxToMicrostacks,
} from '@secretkeylabs/xverse-core';
import { handleKeyDownFeeRateInput } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import {
  Container,
  ControlsContainer,
  FeeContainer,
  FeeText,
  InfoContainer,
  InputContainer,
  InputField,
  InputLabel,
  StyledActionButton,
  StyledFiatAmountText,
  StyledInputFeedback,
  TotalFeeText,
} from './index.styled';

export default function CustomFee({
  visible,
  onClose,
  onClickApply,
  calculateTotalFee,
  feeRate,
  fee,
  initialTotalFee,
  minimumFeeRate,
  isFeeLoading,
  error,
  isBtc,
}: {
  visible: boolean;
  onClose: () => void;
  onClickApply: (feeRate: string, fee: string) => void;
  calculateTotalFee: (feeRate: string) => Promise<number | undefined>;
  feeRate?: string;
  fee?: string;
  minimumFeeRate: string;
  initialTotalFee: string;
  isFeeLoading: boolean;
  error: string;
  isBtc: boolean;
}) {
  const { t } = useTranslation('translation', {
    keyPrefix: 'TRANSACTION_SETTING',
  });
  const { t: tUnits } = useTranslation('translation', { keyPrefix: 'UNITS' });

  const { btcFiatRate, stxBtcRate, fiatCurrency } = useWalletSelector();
  const [feeRateInput, setFeeRateInput] = useState(feeRate || minimumFeeRate);
  const [totalFee, setTotalFee] = useState(fee || initialTotalFee);

  const fetchTotalFee = async () => {
    const response = await calculateTotalFee(feeRateInput);

    if (response) {
      setTotalFee(response.toString());
    }
  };

  useEffect(() => {
    fetchTotalFee();
  }, [feeRateInput]);

  const handleChangeFeeRateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeeRateInput(e.target.value);
  };

  const handleClickApply = () => {
    // apply state to parent
    onClickApply(feeRateInput, totalFee);
  };

  let fiatFee = BigNumber(0);

  if (totalFee) {
    fiatFee = isBtc
      ? getBtcFiatEquivalent(BigNumber(totalFee), BigNumber(btcFiatRate))
      : getStxFiatEquivalent(
          stxToMicrostacks(BigNumber(totalFee)),
          BigNumber(stxBtcRate),
          BigNumber(btcFiatRate),
        );
  }

  return (
    <BottomModal visible={visible} header={t('CUSTOM_FEE')} onClose={onClose}>
      <Container>
        <FeeContainer>
          <InputContainer withError={!!error}>
            <InputField
              type="number"
              value={feeRateInput?.toString()}
              onKeyDown={isBtc ? handleKeyDownFeeRateInput : undefined}
              onChange={handleChangeFeeRateInput}
            />
            <InputLabel>
              {isBtc ? (
                tUnits('SATS_PER_VB')
              ) : (
                <StyledFiatAmountText fiatAmount={fiatFee} fiatCurrency={fiatCurrency} />
              )}
            </InputLabel>
          </InputContainer>
        </FeeContainer>
        <InfoContainer>
          {error && <StyledInputFeedback message={error} variant="danger" />}
          {!error && isBtc && minimumFeeRate && Number(feeRateInput) >= Number(minimumFeeRate) && (
            <>
              <TotalFeeText>
                {t('TOTAL_FEE')}:
                <NumericFormat
                  value={totalFee}
                  displayType="text"
                  thousandSeparator
                  suffix=" Sats"
                  renderText={(value: string) => <FeeText>{value}</FeeText>}
                />
              </TotalFeeText>
              <StyledFiatAmountText fiatAmount={fiatFee} fiatCurrency={fiatCurrency} />
            </>
          )}
        </InfoContainer>
      </Container>
      <ControlsContainer>
        <StyledActionButton
          text={t('BACK')}
          processing={isFeeLoading}
          disabled={isFeeLoading}
          onPress={onClose}
          transparent
        />
        <StyledActionButton
          text={t('APPLY')}
          processing={isFeeLoading}
          disabled={isFeeLoading}
          onPress={handleClickApply}
        />
      </ControlsContainer>
    </BottomModal>
  );
}
