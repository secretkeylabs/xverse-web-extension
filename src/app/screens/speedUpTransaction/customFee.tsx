import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import FiatAmountText from '@components/fiatAmountText';
import useWalletSelector from '@hooks/useWalletSelector';
import { getBtcFiatEquivalent } from '@secretkeylabs/xverse-core';
import InputFeedback from '@ui-library/inputFeedback';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const InfoContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: props.theme.spacing(6),
}));

const TotalFeeText = styled.span((props) => ({
  ...props.theme.typography.body_medium_m,
  display: 'flex',
  columnGap: props.theme.spacing(2),
  color: props.theme.colors.white_200,
}));

const InputContainer = styled.div<{ withError?: boolean }>((props) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: `1px solid ${
    props.withError ? props.theme.colors.danger_dark_200 : props.theme.colors.white_800
  }`,
  backgroundColor: props.theme.colors.elevation1,
  borderRadius: props.theme.radius(1),
  marginTop: props.theme.spacing(4),
  padding: props.theme.spacing(6),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

const InputField = styled.input((props) => ({
  ...props.theme.typography.body_medium_m,
  backgroundColor: 'transparent',
  color: props.theme.colors.white_200,
  border: 'transparent',
  width: '80%',
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

const InputLabel = styled.span((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
}));

const FeeText = styled.span((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

const FeeContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const ControlsContainer = styled.div`
  display: flex;
  gap: 12px;
  margin: 32px 16px 40px;
`;

const StyledInputFeedback = styled(InputFeedback)`
  margin-top: ${(props) => props.theme.spacing(2)}px;
`;

const StyledFiatAmountText = styled(FiatAmountText)((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
}));

const StyledActionButton = styled(ActionButton)((props) => ({
  'div, h1': {
    ...props.theme.typography.body_medium_m,
  },
}));

export default function CustomFee({
  visible,
  onClose,
  onClickApply,
  calculateTotalFee,
  fee,
  initialFeeRate,
  isFeeLoading,
  error,
}: {
  visible: boolean;
  onClose: () => void;
  onClickApply: (feeRate: string) => void;
  calculateTotalFee: (feeRate: string) => Promise<number | undefined>;
  fee: string;
  initialFeeRate: string;
  isFeeLoading: boolean;
  error: string;
}) {
  const { t } = useTranslation('translation');
  const { btcFiatRate, fiatCurrency } = useWalletSelector();
  const [feeRateInput, setFeeRateInput] = useState(initialFeeRate);
  const [totalFee, setTotalFee] = useState(fee);

  const fetchTotalFee = async () => {
    const response = await calculateTotalFee(feeRateInput);

    if (response) {
      setTotalFee(response.toString());
    }
  };

  useEffect(() => {
    fetchTotalFee();
  }, [feeRateInput]);

  /* callbacks */
  const handleKeyDownFeeRateInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // only allow positive integers
    // disable common special characters, including - and .
    // eslint-disable-next-line no-useless-escape
    if (e.key.match(/^[!-\/:-@[-`{-~]$/)) {
      e.preventDefault();
    }
  };

  const handleChangeFeeRateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeeRateInput(e.target.value);
  };

  const handleClickApply = () => {
    // apply state to parent
    onClickApply(feeRateInput);
  };

  const fiatFee = getBtcFiatEquivalent(new BigNumber(totalFee), BigNumber(btcFiatRate));

  return (
    <BottomModal visible={visible} header={t('TRANSACTION_SETTING.CUSTOM_FEE')} onClose={onClose}>
      <Container>
        <FeeContainer>
          <InputContainer withError={!!error}>
            <InputField
              type="number"
              value={feeRateInput?.toString()}
              onKeyDown={handleKeyDownFeeRateInput}
              onChange={handleChangeFeeRateInput}
            />
            <InputLabel>Sats /vB</InputLabel>
          </InputContainer>
          <StyledInputFeedback message={error} variant="danger" />
        </FeeContainer>
        <InfoContainer>
          <TotalFeeText>
            {t('TRANSACTION_SETTING.TOTAL_FEE')}
            <NumericFormat
              value={totalFee}
              displayType="text"
              thousandSeparator
              suffix=" Sats"
              renderText={(value: string) => <FeeText>{value}</FeeText>}
            />
          </TotalFeeText>
          <StyledFiatAmountText fiatAmount={fiatFee} fiatCurrency={fiatCurrency} />
        </InfoContainer>
      </Container>
      <ControlsContainer>
        <StyledActionButton
          text={t('TRANSACTION_SETTING.BACK')}
          processing={isFeeLoading}
          disabled={isFeeLoading}
          onPress={onClose}
          transparent
        />
        <StyledActionButton
          text={t('TRANSACTION_SETTING.APPLY')}
          processing={isFeeLoading}
          disabled={isFeeLoading}
          onPress={handleClickApply}
        />
      </ControlsContainer>
    </BottomModal>
  );
}
