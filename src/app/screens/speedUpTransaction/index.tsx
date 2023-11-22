import { BetterBarLoader } from '@components/barLoader';
import ActionButton from '@components/button';
import FiatAmountText from '@components/fiatAmountText';
import TopRow from '@components/topRow';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useWalletSelector from '@hooks/useWalletSelector';
import { CarProfile, Faders, RocketLaunch } from '@phosphor-icons/react';
import { getBtcFiatEquivalent } from '@secretkeylabs/xverse-core';
import InputFeedback from '@ui-library/inputFeedback';
import BigNumber from 'bignumber.js';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  marginTop: props.theme.spacing(8),
  marginBottom: props.theme.spacing(8),
}));

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(2),
}));

const DetailText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.spacing(4),
}));

// TODO create input component in ui-library
const InputContainer = styled.div<{ withError?: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(6),
  border: `1px solid ${
    props.withError ? props.theme.colors.danger_dark_200 : props.theme.colors.white_800
  }`,
  backgroundColor: props.theme.colors.elevation1,
  borderRadius: props.theme.radius(3),
  padding: props.theme.spacing(5),
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
  ...props.theme.body_m,
  color: props.theme.colors.white_0,
}));

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${(props) => props.theme.spacing(6)}px;
  gap: ${(props) => props.theme.spacing(4)}px;
`;

const FeeButton = styled.button<{
  isSelected: boolean;
}>((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  color: props.theme.colors.white_0,
  backgroundColor: `${props.isSelected ? props.theme.colors.elevation6_600 : 'transparent'}`,
  border: `1px solid ${
    props.isSelected ? props.theme.colors.white_800 : props.theme.colors.white_850
  }`,
  borderRadius: props.theme.radius(2),
  height: 65,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'background-color 0.1s ease-in-out, border 0.1s ease-in-out',
  padding: props.theme.spacing(8),
  paddingTop: props.theme.spacing(6),
  paddingBottom: props.theme.spacing(6),
}));

const FeeContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const TickerContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  flex: 1,
});

const ControlsContainer = styled.div`
  display: flex;
  column-gap: 12px;
  margin: 20px 16px 40px;
`;

const StyledInputFeedback = styled(InputFeedback)`
  margin-bottom: ${(props) => props.theme.spacing(2)}px;
`;

const StyledFiatAmountText = styled(FiatAmountText)((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white_400,
}));

export type OnChangeFeeRate = (feeRate: string) => void;

function SpeedUpTransactionScreen() {
  const {
    onClickApply,
    onChangeFeeRate,
    fee,
    initialFeeRate,
    isFeeLoading,
    error,
  }: {
    onClickApply: OnChangeFeeRate;
    onChangeFeeRate: OnChangeFeeRate;
    fee: string;
    initialFeeRate: string;
    isFeeLoading: boolean;
    error: string;
  } = {
    onClickApply: () => {},
    onChangeFeeRate: () => {},
    fee: '',
    initialFeeRate: '',
    isFeeLoading: false,
    error: '',
  };
  const { t } = useTranslation('translation', { keyPrefix: 'SPEED_UP_TRANSACTION' });
  const { btcFiatRate, fiatCurrency } = useWalletSelector();
  const { data: feeRates } = useBtcFeeRate();
  const theme = useTheme();
  const navigate = useNavigate();

  // save the previous state in case user clicks X without applying
  const [previousFeeRate, setPreviousFeeRate] = useState(initialFeeRate);
  const [previousSelectedOption, setPreviousSelectedOption] = useState('standard');

  const [feeRateInput, setFeeRateInput] = useState(previousFeeRate);
  const [selectedOption, setSelectedOption] = useState(previousSelectedOption);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onChangeFeeRate(feeRateInput);
  }, [feeRateInput, onChangeFeeRate]);

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
    if (selectedOption !== 'custom') {
      setSelectedOption('custom');
    }
  };

  const handleClickFeeButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedOption(e.currentTarget.value);
    if (feeRates) {
      switch (e.currentTarget.value) {
        case 'high':
          setFeeRateInput(feeRates.priority.toString());
          break;
        case 'standard':
          setFeeRateInput(feeRates.regular.toString());
          break;
        case 'custom':
          inputRef.current?.focus();
          break;
        default:
          break;
      }
    }
  };

  const handleClickCancel = () => {
    // reset state
    setFeeRateInput(previousFeeRate);
    setSelectedOption(previousSelectedOption);

    navigate('/coinDashboard/BTC');
  };

  const handleClickSubmit = () => {
    // save state
    setPreviousFeeRate(feeRateInput);
    setPreviousSelectedOption(selectedOption);
    // apply state to parent
    onClickApply(feeRateInput);

    toast.success('Transaction fee updated');

    navigate('/coinDashboard/BTC');
  };

  const fiatFee = getBtcFiatEquivalent(new BigNumber(fee), new BigNumber(btcFiatRate));

  const handleBackButtonClick = () => {
    navigate('/coinDashboard/BTC');
  };

  return (
    <>
      <TopRow title="" onClick={handleBackButtonClick} />
      <Container>
        <Title>{t('TITLE')}</Title>
        <DetailText>{t('FEE_INFO')}</DetailText>
        <DetailText>
          {t('CURRENT_FEE')} {initialFeeRate} sats /vB
        </DetailText>
        <DetailText>{t('ESTIMATED_COMPLETION_TIME')} min</DetailText>
        <ButtonContainer>
          <FeeButton
            key="high"
            value="high"
            isSelected={selectedOption === 'high'}
            onClick={handleClickFeeButton}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(6) }}>
              <RocketLaunch size={20} color={theme.colors.tangerine} />
              <div>
                {t('HIGH_PRIORITY')}
                <div>759 Sats /vByte</div>
              </div>
            </div>
            <div>
              <div>90,000 Sats</div>
              <div>~ $6.10 USD</div>
            </div>
          </FeeButton>
          <FeeButton
            key="medium"
            value="medium"
            isSelected={selectedOption === 'medium'}
            onClick={handleClickFeeButton}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(6) }}>
              <CarProfile size={20} color={theme.colors.tangerine} />
              <div>
                {t('MED_PRIORITY')}
                <div>759 Sats /vByte</div>
              </div>
            </div>
            <div>
              <div>90,000 Sats</div>
              <div>~ $6.10 USD</div>
            </div>
          </FeeButton>
          <FeeButton
            key="custom"
            value="custom"
            isSelected={selectedOption === 'custom'}
            onClick={handleClickFeeButton}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(6) }}>
              <Faders
                size={20}
                color={theme.colors.tangerine}
                style={{ transform: 'rotate(90deg)' }}
              />
              <div>
                {t('CUSTOM')}
                <div>759 Sats /vByte</div>
              </div>
            </div>
            <div>
              <div>90,000 Sats</div>
              <div>~ $6.10 USD</div>
            </div>
          </FeeButton>
        </ButtonContainer>
      </Container>
      <ControlsContainer>
        <ActionButton
          text={t('CANCEL')}
          processing={isFeeLoading}
          disabled={isFeeLoading || !!error}
          onPress={handleClickCancel}
          transparent
        />
        <ActionButton
          text={t('SUBMIT')}
          processing={isFeeLoading}
          disabled={isFeeLoading || !!error}
          onPress={handleClickSubmit}
        />
      </ControlsContainer>
    </>
  );
}

export default SpeedUpTransactionScreen;
