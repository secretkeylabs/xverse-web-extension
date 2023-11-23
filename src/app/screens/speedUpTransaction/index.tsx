import ActionButton from '@components/button';
import TopRow from '@components/topRow';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import { CarProfile, Faders, RocketLaunch } from '@phosphor-icons/react';
import { rbf } from '@secretkeylabs/xverse-core';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { CustomFee } from './customFee';

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

const DetailText = styled.span((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.spacing(4),
}));

const HighlightedText = styled.span((props) => ({
  ...props.theme.typography.body_medium_m,
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
  height: 'auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'background-color 0.1s ease-in-out, border 0.1s ease-in-out',
  padding: props.theme.spacing(8),
  paddingTop: props.theme.spacing(6),
  paddingBottom: props.theme.spacing(6),
  ':not(:disabled):hover': {
    borderColor: props.theme.colors.white_800,
  },
  ':disabled': {
    cursor: 'not-allowed',
    color: props.theme.colors.white_400,
    div: {
      color: 'inherit',
    },
    svg: {
      fill: props.theme.colors.white_600,
    },
  },
}));

const ControlsContainer = styled.div`
  display: flex;
  column-gap: 12px;
  margin: 20px 16px 40px;
`;

const CustomFeeIcon = styled(Faders)({
  transform: 'rotate(90deg)',
});

const FeeButtonLeft = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  gap: props.theme.spacing(6),
}));

const FeeButtonRight = styled.div({
  textAlign: 'right',
});

const SecondaryText = styled.div<{
  alignRight?: boolean;
}>((props) => ({
  ...props.theme.typography.body_medium_s,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(2),
  textAlign: props.alignRight ? 'right' : 'left',
}));

const StyledActionButton = styled(ActionButton)((props) => ({
  'div, h1': {
    ...props.theme.typography.body_medium_m,
  },
}));

const WarningText = styled.span((props) => ({
  ...props.theme.typography.body_medium_s,
  display: 'block',
  color: props.theme.colors.danger_light,
  marginTop: props.theme.spacing(2),
}));

function SpeedUpTransactionScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SPEED_UP_TRANSACTION' });
  const { data: feeRates } = useBtcFeeRate();
  const theme = useTheme();
  const navigate = useNavigate();
  const [showCustomFee, setShowCustomFee] = useState(false);

  // const fetchRbfRecommendedFees = async () => {
  //   const rbfTransaction = new rbf.RbfTransaction(transaction, rbfProps);
  //   const mempoolFees = {
  //   };

  //   const response = await rbfTransaction.getRbfRecommendedFees(mempoolFees);
  //   console.log(response);

  // useEffect(() => {
  //   fetchRbfRecommendedFees();
  // }, []);

  const [feeRateInput, setFeeRateInput] = useState('1');
  const [selectedOption, setSelectedOption] = useState<string | undefined>();

  const handleClickFeeButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.value === 'high' || e.currentTarget.value === 'medium') {
      setSelectedOption(e.currentTarget.value);
    }

    if (feeRates) {
      switch (e.currentTarget.value) {
        case 'high':
          setFeeRateInput(feeRates.priority.toString());
          break;
        case 'medium':
          setFeeRateInput(feeRates.regular.toString());
          break;
        case 'custom':
          setShowCustomFee(true);
          break;
        default:
          break;
      }
    }
  };

  const handleClickCancel = () => {
    navigate(-1);
  };

  const handleClickSubmit = () => {
    toast.success('Transaction fee updated');

    navigate(-1);
  };

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  return (
    <>
      <TopRow title="" onClick={handleBackButtonClick} />
      <Container>
        <Title>{t('TITLE')}</Title>
        <DetailText>{t('FEE_INFO')}</DetailText>
        <DetailText>
          {t('CURRENT_FEE')} <HighlightedText>{feeRateInput} sats /vB</HighlightedText>
        </DetailText>
        <DetailText>
          {t('ESTIMATED_COMPLETION_TIME')} <HighlightedText>~30 min</HighlightedText>
        </DetailText>
        <ButtonContainer>
          <FeeButton
            key="high"
            value="high"
            isSelected={selectedOption === 'high'}
            onClick={handleClickFeeButton}
            disabled
          >
            <FeeButtonLeft>
              <RocketLaunch size={20} color={theme.colors.tangerine} />
              <div>
                {t('HIGH_PRIORITY')}
                <SecondaryText>759 Sats /vByte</SecondaryText>
              </div>
            </FeeButtonLeft>
            <FeeButtonRight>
              <div>90,000 Sats</div>
              <SecondaryText alignRight>~ $6.10 USD</SecondaryText>
              <WarningText>Insufficient funds</WarningText>
            </FeeButtonRight>
          </FeeButton>
          <FeeButton
            key="medium"
            value="medium"
            isSelected={selectedOption === 'medium'}
            onClick={handleClickFeeButton}
          >
            <FeeButtonLeft>
              <CarProfile size={20} color={theme.colors.tangerine} />
              <div>
                {t('MED_PRIORITY')}
                <SecondaryText>759 Sats /vByte</SecondaryText>
              </div>
            </FeeButtonLeft>
            <div>
              <div>90,000 Sats</div>
              <SecondaryText alignRight>~ $6.10 USD</SecondaryText>
            </div>
          </FeeButton>
          {true ? ( // TODO: Show the custom values if user applied it
            <FeeButton
              key="custom"
              value="custom"
              isSelected={selectedOption === 'custom'}
              onClick={handleClickFeeButton}
            >
              <FeeButtonLeft>
                <CustomFeeIcon size={20} color={theme.colors.tangerine} />
                <div>{t('CUSTOM')}</div>
              </FeeButtonLeft>
              <div>Manual setting</div>
            </FeeButton>
          ) : (
            <FeeButton
              key="custom"
              value="custom"
              isSelected={selectedOption === 'custom'}
              onClick={handleClickFeeButton}
            >
              <FeeButtonLeft>
                <CustomFeeIcon size={20} color={theme.colors.tangerine} />
                <div>
                  {t('CUSTOM')}
                  <SecondaryText>759 Sats /vByte</SecondaryText>
                </div>
              </FeeButtonLeft>
              <div>
                <div>90,000 Sats</div>
                <SecondaryText alignRight>~ $6.10 USD</SecondaryText>
              </div>
            </FeeButton>
          )}
        </ButtonContainer>
      </Container>
      <ControlsContainer>
        <StyledActionButton text={t('CANCEL')} onPress={handleClickCancel} transparent />
        <StyledActionButton
          text={t('SUBMIT')}
          disabled={!selectedOption}
          onPress={handleClickSubmit}
        />
      </ControlsContainer>

      <CustomFee
        visible={showCustomFee}
        onClose={() => setShowCustomFee(false)}
        initialFeeRate={feeRateInput}
        fee={feeRateInput}
        isFeeLoading={false}
        error=""
        onChangeFeeRate={setFeeRateInput}
        onClickApply={(feeRate: string) => {}}
        setSelectedOption={setSelectedOption}
      />
    </>
  );
}

export default SpeedUpTransactionScreen;
