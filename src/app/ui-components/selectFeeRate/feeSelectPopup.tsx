import FiatAmountText from '@components/fiatAmountText';
import { Faders } from '@phosphor-icons/react';
import type { SupportedCurrency } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { HorizontalSplitButtonContainer, StyledP } from '@ui-library/common.styled';
import Input from '@ui-library/input';
import type { FeedbackVariant } from '@ui-library/inputFeedback';
import Sheet from '@ui-library/sheet';
import Spinner from '@ui-library/spinner';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import FeeItem, { FeeItemContainer } from './feeItem';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailText = styled(StyledP)`
  margin-bottom: ${(props) => props.theme.space.l};
`;

const FeePrioritiesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.xs};
  margin-bottom: ${(props) => props.theme.space.l};
`;

const TextRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex: 1;
`;

const SummaryContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${(props) => props.theme.space.s};
  margin-bottom: ${(props) => props.theme.space.xs};
`;
const TotalFeeContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;

  gap: ${(props) => props.theme.space.xxs};
`;

const Buttons = styled(HorizontalSplitButtonContainer)`
  margin: ${(props) => props.theme.space.l} 0;
`;

const RotatedFaders = styled(Faders)`
  transform: rotate(90deg);
`;

const StyledFiatAmountText = styled(FiatAmountText)`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_200};
`;

export type FeePriority = 'high' | 'medium' | 'low';

type Props = {
  currentFeeRate: string;
  feeUnits: string;
  feeRateUnits?: string;
  fiatUnit: string;
  feeRates: {
    low?: number;
    medium?: number;
    high?: number;
  };
  feeRateLimits?: {
    min?: number;
    max?: number;
  };
  onClose: () => void;
  baseToFiat: (base: string) => string;
  setFeeRate: (feeRate: string) => void;
  getFeeForFeeRate: (feeRate: number) => Promise<number | undefined>;
  absoluteBalance?: number;
  amount?: number;
  selected: FeePriority | 'custom' | null;
  setSelected: (selected: FeePriority | 'custom' | null) => void;
};

function FeeSelectPopup({
  currentFeeRate,
  feeUnits,
  feeRateUnits,
  fiatUnit,
  feeRates,
  feeRateLimits,
  onClose,
  baseToFiat,
  setFeeRate,
  getFeeForFeeRate,
  absoluteBalance,
  amount,
  selected,
  setSelected,
}: Props) {
  const stxInputExtractor = /[0-9]+[.]?[0-9]{0,6}/;
  const inputValidator = absoluteBalance ? stxInputExtractor : /^[0-9]*$/;

  const { t } = useTranslation('translation');
  const theme = useTheme();

  const [useCustom, setUseCustom] = useState(false);
  const [customValue, setCustomValue] = useState(currentFeeRate);
  const [isCustomValueValid, setIsCustomValueValid] = useState(true);
  const [hasSufficientFunds, setHasSufficientFunds] = useState(true);
  const [customValueTotalFee, setCustomValueTotalFee] = useState('');
  const [customValueTotalFeeFiat, setCustomValueTotalFeeFiat] = useState('');
  const [isCalculatingTotalFee, setIsCalculatingTotalFee] = useState(false);

  useEffect(() => {
    const calculateTotalFee = async () => {
      setIsCalculatingTotalFee(true);
      try {
        const totalFee = await getFeeForFeeRate(Number(customValue));
        if (totalFee) {
          setCustomValueTotalFee(totalFee.toString());
          setCustomValueTotalFeeFiat(baseToFiat(totalFee.toString()));
          setHasSufficientFunds(true);
        } else {
          setHasSufficientFunds(false);
        }
      } finally {
        setIsCalculatingTotalFee(false);
      }
    };

    calculateTotalFee();
  }, [customValue]);

  const handleClick = (newRate: string, newSelected: FeePriority | 'custom' | null) => () => {
    setFeeRate(newRate);
    setSelected(newSelected);
    onClose();
  };

  const { knownRates } = useMemo(() => {
    const rates: FeePriority[] = [];
    if (feeRates.high) {
      rates.push('high');
    }

    if (feeRates.medium) {
      rates.push('medium');
    }

    if (feeRates.low) {
      rates.push('low');
    }

    return { knownRates: rates };
  }, [feeRates]);

  const renderFeeSelectors = () => {
    if (useCustom) {
      const onCustomValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        setIsCustomValueValid(inputValidator.test(e.target.value));
        setCustomValue(e.target.value);
      };

      const onApply = () => {
        if (!hasSufficientFunds) return;

        setSelected('custom');
        setFeeRate(`${+customValue}`);
        onClose();
      };

      const rateTooLow = !!feeRateLimits?.min && Number(customValue) < feeRateLimits.min;
      const rateTooHigh = !!feeRateLimits?.max && Number(customValue) > feeRateLimits.max;

      const errorText =
        // eslint-disable-next-line eqeqeq
        +customValue == 0
          ? undefined
          : !hasSufficientFunds
          ? t('SEND.INSUFFICIENT_FUNDS')
          : rateTooLow
          ? t('SEND.RATE_TOO_LOW', { minFee: feeRateLimits?.min })
          : rateTooHigh
          ? t('SEND.RATE_TOO_HIGH', { maxFee: feeRateLimits?.max })
          : undefined;

      const inputFeedback: {
        message: string;
        variant?: FeedbackVariant;
      }[] = [];

      if (customValue && !isCustomValueValid) {
        inputFeedback.push({
          variant: 'danger' as const,
          message: t('SEND.INVALID_FEE_RATE'),
        });
      } else if (errorText) {
        inputFeedback.push({
          variant: 'danger' as const,
          message: errorText,
        });
      }

      return (
        <>
          <Input
            onChange={onCustomValueChange}
            value={customValue}
            placeholder="0"
            complications={feeRateUnits}
            feedback={inputFeedback}
            hideClear
            autoFocus
            bgColor={theme.colors.elevation2}
          />
          <SummaryContainer>
            {customValue && hasSufficientFunds && !isCalculatingTotalFee && (
              <>
                <TotalFeeContainer>
                  <StyledP typography="body_medium_m" color="white_200">
                    {t('TRANSACTION_SETTING.TOTAL_FEE')}:
                  </StyledP>
                  <StyledP typography="body_medium_m" color="white_0">
                    {customValueTotalFee} {feeUnits}
                  </StyledP>
                </TotalFeeContainer>
                <StyledFiatAmountText
                  fiatAmount={BigNumber(customValueTotalFeeFiat)}
                  fiatCurrency={fiatUnit as SupportedCurrency}
                />
              </>
            )}
            {isCalculatingTotalFee && <Spinner />}
          </SummaryContainer>
          <Buttons>
            <Button
              title={t('COMMON.BACK')}
              onClick={() => setUseCustom(false)}
              variant="secondary"
            />
            <Button
              title={t('COMMON.APPLY')}
              onClick={onApply}
              disabled={
                !hasSufficientFunds ||
                !customValue ||
                rateTooLow ||
                rateTooHigh ||
                inputFeedback.some((i) => i.variant === 'danger')
              }
            />
          </Buttons>
        </>
      );
    }

    return (
      <FeePrioritiesContainer>
        {knownRates.map((rate) => (
          <FeeItem
            key={rate}
            priority={rate}
            feeRate={feeRates[rate]!}
            onClick={handleClick(feeRates[rate]!.toString(), rate)}
            selected={selected === rate}
            feeUnits={feeUnits}
            feeRateUnits={feeRateUnits}
            fiatUnit={fiatUnit}
            baseToFiat={baseToFiat}
            getFeeForFeeRate={getFeeForFeeRate}
            absoluteBalance={absoluteBalance}
            amount={amount}
          />
        ))}
        <FeeItemContainer $isSelected={selected === 'custom'} onClick={() => setUseCustom(true)}>
          <RotatedFaders size={20} color={theme.colors.tangerine} />
          <TextRow>
            <StyledP typography="body_medium_m" color="white_0">
              {t('TRANSACTION_SETTING.CUSTOM')}
            </StyledP>
            <StyledP typography="body_medium_m" color="white_0">
              {t('TRANSACTION_SETTING.MANUAL_SETTING')}
            </StyledP>
          </TextRow>
        </FeeItemContainer>
      </FeePrioritiesContainer>
    );
  };

  return (
    <Sheet title={t('CONFIRM_TRANSACTION.EDIT_FEES')} onClose={onClose} visible>
      <Container>
        <DetailText typography="body_m" color="white_200">
          {t('TRANSACTION_SETTING.FEE_INFO')}
        </DetailText>
        {renderFeeSelectors()}
      </Container>
    </Sheet>
  );
}

export default FeeSelectPopup;
