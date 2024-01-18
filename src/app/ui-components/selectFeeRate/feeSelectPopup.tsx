import { Faders } from '@phosphor-icons/react';
import { currencySymbolMap } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import Input from '@ui-library/input';
import Sheet from '@ui-library/sheet';
import Spinner from '@ui-library/spinner';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled, { useTheme } from 'styled-components';
import FeeItem from './feeItem';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailText = styled(StyledP)`
  margin-bottom: ${(props) => props.theme.space.l};
`;

const FeePrioritiesContainer = styled.div`
  display: flex;
  margin-top: ${(props) => props.theme.space.m};
  flex-direction: column;
`;

const FeeItemContainer = styled.button<{ $isSelected: boolean }>`
  display: flex;
  padding: ${(props) => props.theme.space.s} ${(props) => props.theme.space.m};
  align-items: center;
  gap: ${(props) => props.theme.space.s};
  align-self: stretch;
  border-radius: ${(props) => props.theme.space.s};
  border: 1px solid ${(props) => props.theme.colors.elevation6};
  flex-direction: row;
  background: ${(props) => (props.$isSelected ? props.theme.colors.elevation6_600 : 'transparent')};
  margin-top: ${(props) => props.theme.space.xs};
  flex: 1;
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

const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  gap: ${(props) => props.theme.space.s};

  margin: ${(props) => props.theme.space.l} 0;
`;

const inputValidator = /^[0-9]*$/;

type FeePriority = 'high' | 'medium' | 'low';

type Props = {
  currentFeeRate: string;
  feeUnits: string;
  feeRateUnits: string;
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
}: Props) {
  const { t } = useTranslation('translation');
  const theme = useTheme();

  const [useCustom, setUseCustom] = useState(false);
  const [customValue, setCustomValue] = useState(currentFeeRate);
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
  }, [baseToFiat, customValue, getFeeForFeeRate]);

  const handleClick = (newRate) => () => {
    setFeeRate(newRate);
    onClose();
  };

  const { knownRates, selected } = useMemo(() => {
    let selectedRate: null | FeePriority = null;

    const rates: FeePriority[] = [];

    if (feeRates.high) {
      rates.push('high');
      if (!selectedRate && currentFeeRate === feeRates.high.toString()) {
        selectedRate = 'high';
      }
    }

    if (feeRates.medium) {
      rates.push('medium');
      if (!selectedRate && currentFeeRate === feeRates.medium.toString()) {
        selectedRate = 'medium';
      }
    }

    if (feeRates.low) {
      rates.push('low');
      if (!selectedRate && currentFeeRate === feeRates.low.toString()) {
        selectedRate = 'low';
      }
    }

    return { knownRates: rates, selected: selectedRate };
  }, [feeRates, currentFeeRate]);

  const renderFeeItem = (priority: FeePriority, rate: number) => (
    <FeeItem
      priority={priority}
      feeRate={rate}
      onClick={handleClick(rate.toString())}
      selected={priority === selected}
      feeUnits={feeUnits}
      feeRateUnits={feeRateUnits}
      fiatUnit={fiatUnit}
      baseToFiat={baseToFiat}
      getFeeForFeeRate={getFeeForFeeRate}
    />
  );

  const renderFeeSelectors = () => {
    if (useCustom) {
      const onCustomValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (inputValidator.test(e.target.value)) setCustomValue(e.target.value);
      };

      const onApply = () => {
        if (!hasSufficientFunds) return;

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

      return (
        <>
          <Input
            onChange={onCustomValueChange}
            value={customValue}
            placeholder="0"
            complications={feeRateUnits}
            hideClear
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
                <NumericFormat
                  value={customValueTotalFeeFiat}
                  displayType="text"
                  thousandSeparator
                  prefix={`~ ${currencySymbolMap[fiatUnit]}`}
                  suffix={` ${fiatUnit}`}
                  renderText={(value: string) => (
                    <StyledP typography="body_medium_m" color="white_200">
                      {value}
                    </StyledP>
                  )}
                />
              </>
            )}
            {isCalculatingTotalFee && <Spinner />}
          </SummaryContainer>
          {errorText && (
            <StyledP typography="body_medium_m" color="danger_light">
              {errorText}
            </StyledP>
          )}
          <Buttons>
            <Button
              title={t('COMMON.BACK')}
              onClick={() => setUseCustom(false)}
              variant="secondary"
            />
            <Button
              title={t('COMMON.APPLY')}
              onClick={onApply}
              disabled={!hasSufficientFunds || !customValue || rateTooLow || rateTooHigh}
            />
          </Buttons>
        </>
      );
    }

    return (
      <FeePrioritiesContainer>
        {knownRates.map((rate) => renderFeeItem(rate, feeRates[rate]!))}
        <FeeItemContainer $isSelected={!selected} onClick={() => setUseCustom(true)}>
          <Faders size={20} color={theme.colors.tangerine} />
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
