import ActionButton from '@components/button';
import TopRow from '@components/topRow';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import { CarProfile, Faders, RocketLaunch } from '@phosphor-icons/react';
import { useState } from 'react';
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

const DetailText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.spacing(4),
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

const ControlsContainer = styled.div`
  display: flex;
  column-gap: 12px;
  margin: 20px 16px 40px;
`;

const CustomFeeIcon = styled(Faders)({
  transform: 'rotate(90deg)',
});

const PriorityFee = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  gap: props.theme.spacing(6),
}));

export type OnChangeFeeRate = (feeRate: string) => void;

function SpeedUpTransactionScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SPEED_UP_TRANSACTION' });
  const { data: feeRates } = useBtcFeeRate();
  const theme = useTheme();
  const navigate = useNavigate();
  const [showCustomFee, setShowCustomFee] = useState(false);

  const [feeRateInput, setFeeRateInput] = useState('1');
  const [selectedOption, setSelectedOption] = useState('standard');

  const handleClickFeeButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedOption(e.currentTarget.value);
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
          {t('CURRENT_FEE')} {feeRateInput} sats /vB
        </DetailText>
        <DetailText>{t('ESTIMATED_COMPLETION_TIME')} min</DetailText>
        <ButtonContainer>
          <FeeButton
            key="high"
            value="high"
            isSelected={selectedOption === 'high'}
            onClick={handleClickFeeButton}
          >
            <PriorityFee>
              <RocketLaunch size={20} color={theme.colors.tangerine} />
              <div>
                {t('HIGH_PRIORITY')}
                <div>759 Sats /vByte</div>
              </div>
            </PriorityFee>
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
            <PriorityFee>
              <CarProfile size={20} color={theme.colors.tangerine} />
              <div>
                {t('MED_PRIORITY')}
                <div>759 Sats /vByte</div>
              </div>
            </PriorityFee>
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
            <PriorityFee>
              <CustomFeeIcon size={20} color={theme.colors.tangerine} />
              <div>
                {t('CUSTOM')}
                <div>759 Sats /vByte</div>
              </div>
            </PriorityFee>
            <div>
              <div>90,000 Sats</div>
              <div>~ $6.10 USD</div>
            </div>
          </FeeButton>
        </ButtonContainer>
      </Container>
      <ControlsContainer>
        <ActionButton text={t('CANCEL')} onPress={handleClickCancel} transparent />
        <ActionButton text={t('SUBMIT')} onPress={handleClickSubmit} />
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
      />
    </>
  );
}

export default SpeedUpTransactionScreen;
