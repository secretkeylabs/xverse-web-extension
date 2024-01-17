import useBtcClient from '@hooks/useBtcClient';
import useBtcFees from '@hooks/useBtcFees';
import useDebounce from '@hooks/useDebounce';
import useOrdinalsByAddress from '@hooks/useOrdinalsByAddress';
import useWalletSelector from '@hooks/useWalletSelector';
import { Faders } from '@phosphor-icons/react';
import {
  currencySymbolMap,
  ErrorCodes,
  getBtcFees,
  getBtcFeesForNonOrdinalBtcSend,
  getBtcFeesForOrdinalSend,
  getBtcFiatEquivalent,
  Recipient,
  UTXO,
} from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import Theme from 'theme';
import FeeItem from './feeItem';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.space.m,
  marginRight: props.theme.space.m,
  paddingBottom: props.theme.space.m,
}));

const DetailText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
}));

interface InputContainerProps {
  withError?: boolean;
}
const InputContainer = styled.div<InputContainerProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: props.theme.space.xs,
  marginBottom: props.theme.space.s,
  border: `1px solid ${
    props.withError ? props.theme.colors.danger_medium : props.theme.colors.elevation6
  }`,
  backgroundColor: props.theme.colors.elevation1,
  borderRadius: props.theme.radius(1),
  padding: props.theme.space.s,
}));

const InputField = styled.input((props) => ({
  ...props.theme.body_m,
  backgroundColor: 'transparent',
  color: props.theme.colors.white_0,
  border: 'transparent',
  width: '50%',
  '&::-webkit-outer-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '&::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '&[type=number]': {
    '-moz-appearance': 'textfield',
  },
}));

const FeeText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_0,
}));

const FeeContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const ErrorText = styled.h1((props) => ({
  ...props.theme.typography.body_s,
  color: props.theme.colors.danger_light,
  marginBottom: props.theme.space.xxs,
}));

const FeePrioritiesContainer = styled.div`
  display: flex;
  margin-top: ${(props) => props.theme.space.m};
  flex-direction: column;
`;

interface FeeContainerProps {
  isSelected: boolean;
}

const FeeItemContainer = styled.button<FeeContainerProps>`
  display: flex;
  padding: ${(props) => props.theme.space.s} ${(props) => props.theme.space.m};
  align-items: center;
  gap: ${(props) => props.theme.space.s};
  align-self: stretch;
  border-radius: ${(props) => props.theme.space.s};
  border: 1px solid ${(props) => props.theme.colors.elevation6};
  flex-direction: row;
  background: ${(props) => (props.isSelected ? props.theme.colors.elevation6_600 : 'transparent')};
  margin-top: ${(props) => props.theme.space.xs};
  flex: 1;
`;

const TextRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex: 1;
`;

const CustomTextsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex: 1;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const TotalFeeText = styled(StyledP)`
  margin-right: ${(props) => props.theme.space.xxs};
`;

interface Props {
  type?: string;
  fee: string;
  feeRate?: BigNumber | string;
  btcRecipients?: Recipient[];
  ordinalTxUtxo?: UTXO;
  isRestoreFlow?: boolean;
  nonOrdinalUtxos?: UTXO[];
  feeMode: string;
  error: string;
  customFeeSelected: boolean;
  setIsLoading: () => void;
  setIsNotLoading: () => void;
  setFee: (fee: string) => void;
  setFeeRate: (feeRate: string) => void;
  setFeeMode: (feeMode: string) => void;
  setError: (error: string) => void;
  setCustomFeeSelected: (selected: boolean) => void;
  feeOptionSelected: (feeRate: string, totalFee: string) => void;
}
function EditBtcFee({
  type,
  fee,
  feeRate,
  btcRecipients,
  ordinalTxUtxo,
  isRestoreFlow,
  nonOrdinalUtxos,
  feeMode,
  error,
  customFeeSelected,
  setIsLoading,
  setIsNotLoading,
  setFee,
  setFeeRate,
  setError,
  setFeeMode,
  setCustomFeeSelected,
  feeOptionSelected,
}: Props) {
  const { t } = useTranslation('translation');
  const { network, btcAddress, btcFiatRate, fiatCurrency, selectedAccount, ordinalsAddress } =
    useWalletSelector();
  const [totalFee, setTotalFee] = useState(fee);
  const [feeRateInput, setFeeRateInput] = useState(feeRate?.toString() ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedFeeRateInput = useDebounce(feeRateInput, 500);
  const { ordinals } = useOrdinalsByAddress(btcAddress);
  const ordinalsUtxos = useMemo(() => ordinals?.map((ord) => ord.utxo), [ordinals]);
  const btcClient = useBtcClient();
  const feeData = useBtcFees({
    isRestoreFlow: !!isRestoreFlow,
    nonOrdinalUtxos,
    btcRecipients,
    type,
    ordinalTxUtxo,
  });

  useEffect(() => {
    setFee(totalFee);
  }, [totalFee]);

  const recalculateFees = async () => {
    if (type === 'BTC') {
      try {
        setIsLoading();
        setError('');

        if (isRestoreFlow) {
          const { fee: modifiedFee, selectedFeeRate } = await getBtcFeesForNonOrdinalBtcSend(
            btcAddress,
            nonOrdinalUtxos!,
            ordinalsAddress,
            network.type,
            feeMode,
            feeRateInput,
          );
          setFeeRateInput(selectedFeeRate!.toString());
          setTotalFee(modifiedFee.toString());
        } else if (btcRecipients && selectedAccount) {
          const { fee: modifiedFee, selectedFeeRate } = await getBtcFees(
            btcRecipients,
            btcAddress,
            btcClient,
            network.type,
            feeMode,
            feeRateInput,
          );
          setFeeRateInput(selectedFeeRate!.toString());
          setTotalFee(modifiedFee.toString());
        }
      } catch (err: any) {
        if (Number(err) === ErrorCodes.InSufficientBalance) {
          setError(t('TX_ERRORS.INSUFFICIENT_BALANCE'));
        } else if (Number(err) === ErrorCodes.InSufficientBalanceWithTxFee) {
          setError(t('TX_ERRORS.INSUFFICIENT_BALANCE_FEES'));
        } else setError(err.toString());
      } finally {
        setIsNotLoading();
      }
    } else if (type === 'Ordinals' && btcRecipients && ordinalTxUtxo) {
      try {
        setIsLoading();
        setError('');

        const { fee: modifiedFee, selectedFeeRate } = await getBtcFeesForOrdinalSend(
          btcRecipients[0].address,
          ordinalTxUtxo,
          btcAddress,
          btcClient,
          network.type,
          ordinalsUtxos || [],
          feeMode,
          feeRateInput,
        );
        if (selectedFeeRate) setFeeRateInput(selectedFeeRate.toString());
        setTotalFee(modifiedFee.toString());
      } catch (err: any) {
        if (Number(err) === ErrorCodes.InSufficientBalance) {
          setError(t('TX_ERRORS.INSUFFICIENT_BALANCE'));
        } else if (Number(err) === ErrorCodes.InSufficientBalanceWithTxFee) {
          setError(t('TX_ERRORS.INSUFFICIENT_BALANCE_FEES'));
        } else setError(err.toString());
      } finally {
        setIsNotLoading();
      }
    }
  };

  useEffect(() => {
    if (feeRateInput) {
      setFeeRate(feeRateInput);
    }
  }, [feeRateInput]);

  useEffect(() => {
    if (debouncedFeeRateInput) {
      recalculateFees();
    }
  }, [debouncedFeeRateInput]);

  function getFiatEquivalent() {
    return getBtcFiatEquivalent(new BigNumber(totalFee), BigNumber(btcFiatRate));
  }

  const getFiatAmountString = (fiatAmount: BigNumber) => {
    if (fiatAmount) {
      if (fiatAmount.isLessThan(0.01)) {
        return `<${currencySymbolMap[fiatCurrency]}0.01 ${fiatCurrency}`;
      }
      return (
        <NumericFormat
          value={fiatAmount.toFixed(2).toString()}
          displayType="text"
          thousandSeparator
          prefix={`~ ${currencySymbolMap[fiatCurrency]}`}
          suffix={` ${fiatCurrency}`}
          renderText={(value: string) => (
            <StyledP typography="body_medium_m" color="white_200">
              {value}
            </StyledP>
          )}
        />
      );
    }
    return '';
  };

  const onInputEditFeesChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    if (error) {
      setError('');
    }

    if (feeMode !== 'custom') {
      setFeeMode('custom');
    }

    setFeeRateInput(value);

    if (type !== 'BTC' && type !== 'Ordinals') {
      setFeeRateInput(value);
      setTotalFee(value);
    }
  };

  return (
    <Container>
      <DetailText>{t('TRANSACTION_SETTING.FEE_INFO')}</DetailText>

      {!customFeeSelected && (
        <FeePrioritiesContainer>
          <FeeItem
            priority="high"
            time="~10 mins"
            feeRate={feeData?.highFeeRate}
            totalFee={feeData?.highTotalFee}
            fiat={getFiatAmountString(
              getBtcFiatEquivalent(new BigNumber(feeData.highTotalFee), BigNumber(btcFiatRate)),
            )}
            onClick={() => {
              feeOptionSelected(feeData?.highFeeRate?.toString() || '', feeData?.highTotalFee);
              setFeeMode('high');
            }}
            selected={feeMode === 'high'}
          />
          <FeeItem
            priority="medium"
            time="~30 mins"
            feeRate={feeData?.standardFeeRate}
            totalFee={feeData?.standardTotalFee}
            fiat={getFiatAmountString(
              getBtcFiatEquivalent(new BigNumber(feeData.standardTotalFee), BigNumber(btcFiatRate)),
            )}
            onClick={() => {
              feeOptionSelected(
                feeData?.standardFeeRate?.toString() || '',
                feeData?.standardTotalFee,
              );
              setFeeMode('medium');
            }}
            selected={feeMode === 'medium'}
          />
          <FeeItemContainer
            isSelected={feeMode === 'custom'}
            onClick={() => {
              setCustomFeeSelected(true);
            }}
          >
            <Faders size={20} color={Theme.colors.tangerine} />
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
      )}

      {customFeeSelected && (
        <FeeContainer>
          <InputContainer withError={!!error}>
            <InputField
              type="number"
              ref={inputRef}
              value={feeRateInput?.toString()}
              onChange={onInputEditFeesChange}
            />
            <FeeText>Sats /vByte</FeeText>
          </InputContainer>
          <CustomTextsContainer>
            <Row>
              <TotalFeeText typography="body_medium_m" color="white_200">
                {t('TRANSACTION_SETTING.TOTAL_FEE')}
              </TotalFeeText>
              <NumericFormat
                value={totalFee}
                displayType="text"
                thousandSeparator
                suffix=" Sats"
                renderText={(value: string) => (
                  <StyledP typography="body_medium_m" color="white_0">
                    {value}
                  </StyledP>
                )}
              />
            </Row>
            <StyledP typography="body_medium_m" color="white_200">
              {getFiatAmountString(getFiatEquivalent())}
            </StyledP>
          </CustomTextsContainer>
          {error && <ErrorText>{error}</ErrorText>}
        </FeeContainer>
      )}
    </Container>
  );
}

export default EditBtcFee;
