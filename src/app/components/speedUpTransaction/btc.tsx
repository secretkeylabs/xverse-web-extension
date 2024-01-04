import FiatAmountText from '@components/fiatAmountText';
import useWalletSelector from '@hooks/useWalletSelector';
import { getBtcFiatEquivalent } from '@secretkeylabs/xverse-core';
import { EMPTY_LABEL } from '@utils/constants';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useTheme } from 'styled-components';
import {
  ButtonContainer,
  Container,
  ControlsContainer,
  CustomFeeIcon,
  DetailText,
  FeeButton,
  FeeButtonLeft,
  FeeButtonRight,
  HighlightedText,
  SecondaryText,
  StyledActionButton,
  Title,
  WarningText,
} from './index.styled';

type TierFees = {
  enoughFunds: boolean;
  fee?: number;
  feeRate: number;
};

interface Props {
  rbfTxSummary?: {
    currentFee: number;
    currentFeeRate: number;
    minimumRbfFee: number;
    minimumRbfFeeRate: number;
  };
  rbfRecommendedFees?: {
    medium?: TierFees;
    high?: TierFees;
    higher?: TierFees;
    highest?: TierFees;
  };
  selectedOption?: string;
  customFeeRate?: string;
  customTotalFee?: string;
  feeButtonMapping: {
    [key: string]: {
      title: string;
      icon: React.ReactNode;
    };
  };
  handleGoBack: () => void;
  handleClickFeeButton: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleClickSubmit: () => void;
  getEstimatedCompletionTime: (feeRate?: number) => string;
}

function SpeedUpBtcTransaction({
  rbfTxSummary,
  rbfRecommendedFees,
  selectedOption,
  customFeeRate,
  customTotalFee,
  feeButtonMapping,
  handleGoBack,
  handleClickFeeButton,
  handleClickSubmit,
  getEstimatedCompletionTime,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SPEED_UP_TRANSACTION' });
  const { btcFiatRate, fiatCurrency } = useWalletSelector();
  const theme = useTheme();

  return (
    <Container>
      <Title>{t('TITLE')}</Title>
      <DetailText>{t('FEE_INFO')}</DetailText>
      <DetailText>
        {t('CURRENT_FEE')}{' '}
        <HighlightedText>
          <NumericFormat
            value={rbfTxSummary?.currentFee}
            displayType="text"
            thousandSeparator
            suffix=" Sats / "
          />
          <NumericFormat
            value={rbfTxSummary?.currentFeeRate}
            displayType="text"
            thousandSeparator
            suffix=" Sats /vB"
          />
        </HighlightedText>
      </DetailText>
      <DetailText>
        {t('ESTIMATED_COMPLETION_TIME')}{' '}
        <HighlightedText>
          {getEstimatedCompletionTime(rbfTxSummary?.currentFeeRate)}
        </HighlightedText>
      </DetailText>
      <ButtonContainer>
        {rbfRecommendedFees &&
          Object.entries(rbfRecommendedFees).map(([key, obj]) => {
            const isDisabled = !obj.enoughFunds;

            return (
              <FeeButton
                key={key}
                value={key}
                isSelected={selectedOption === key}
                onClick={handleClickFeeButton}
                disabled={isDisabled}
              >
                <FeeButtonLeft>
                  {feeButtonMapping[key].icon}
                  <div>
                    {feeButtonMapping[key].title}
                    <SecondaryText>{getEstimatedCompletionTime(obj.feeRate)}</SecondaryText>
                    <SecondaryText>
                      <NumericFormat
                        value={obj.feeRate}
                        displayType="text"
                        thousandSeparator
                        suffix=" Sats /vByte"
                      />
                    </SecondaryText>
                  </div>
                </FeeButtonLeft>
                <FeeButtonRight>
                  <div>
                    {obj.fee ? (
                      <NumericFormat
                        value={obj.fee}
                        displayType="text"
                        thousandSeparator
                        suffix=" Sats"
                      />
                    ) : (
                      EMPTY_LABEL
                    )}
                  </div>
                  <SecondaryText alignRight>
                    {obj.fee ? (
                      <FiatAmountText
                        fiatAmount={getBtcFiatEquivalent(
                          BigNumber(obj.fee),
                          BigNumber(btcFiatRate),
                        )}
                        fiatCurrency={fiatCurrency}
                      />
                    ) : (
                      `${EMPTY_LABEL} ${fiatCurrency}`
                    )}
                  </SecondaryText>
                  {isDisabled && <WarningText>{t('INSUFFICIENT_FUNDS')}</WarningText>}
                </FeeButtonRight>
              </FeeButton>
            );
          })}
        <FeeButton
          key="custom"
          value="custom"
          isSelected={selectedOption === 'custom'}
          onClick={handleClickFeeButton}
          centered={!customFeeRate}
        >
          <FeeButtonLeft>
            <CustomFeeIcon size={20} color={theme.colors.tangerine} />
            <div>
              {t('CUSTOM')}
              {customFeeRate && (
                <>
                  <SecondaryText>{getEstimatedCompletionTime(Number(customFeeRate))}</SecondaryText>
                  <SecondaryText>
                    <NumericFormat
                      value={customFeeRate}
                      displayType="text"
                      thousandSeparator
                      suffix=" Sats /vByte"
                    />
                  </SecondaryText>
                </>
              )}
            </div>
          </FeeButtonLeft>
          <FeeButtonRight>
            {customFeeRate && customTotalFee ? (
              <>
                <NumericFormat
                  value={customTotalFee}
                  displayType="text"
                  thousandSeparator
                  suffix=" Sats"
                  renderText={(value: string) => <HighlightedText>{value}</HighlightedText>}
                />
                <SecondaryText alignRight>
                  <FiatAmountText
                    fiatAmount={getBtcFiatEquivalent(
                      BigNumber(customTotalFee),
                      BigNumber(btcFiatRate),
                    )}
                    fiatCurrency={fiatCurrency}
                  />
                </SecondaryText>
              </>
            ) : (
              t('MANUAL_SETTING')
            )}
          </FeeButtonRight>
        </FeeButton>
      </ButtonContainer>
      <ControlsContainer>
        <StyledActionButton text={t('CANCEL')} onPress={handleGoBack} transparent />
        <StyledActionButton
          text={t('SUBMIT')}
          disabled={!selectedOption}
          onPress={handleClickSubmit}
        />
      </ControlsContainer>
    </Container>
  );
}

export default SpeedUpBtcTransaction;
