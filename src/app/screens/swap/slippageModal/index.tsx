import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import Input from '@ui-library/input';
import BigNumber from 'bignumber.js';
import { useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 16px;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ResetButton = styled.button((props) => ({
  display: 'inline',
  background: 'transparent',
  color: props.theme.colors.orange_main,
  ...props.theme.body_medium_m,
  ':hover': {
    opacity: 0.8,
  },
}));

const Title = styled.div((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
}));

const Description = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_400,
}));

function SlippageModalContent({
  defaultSlippage,
  slippage,
  slippageThreshold,
  slippageDecimals,
  onChange,
}: {
  defaultSlippage: number;
  slippage: number;
  slippageThreshold?: number;
  slippageDecimals?: number;
  onChange: (slippage: number) => void;
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const [percentage, setPercentage] = useState(new BigNumber(slippage).times(100).toString());

  const result = new BigNumber(percentage);
  const invalid = result.isNaN() || result.gte(100);
  const showSlippageWarning = slippageThreshold
    ? result.gt(new BigNumber(slippageThreshold).times(100))
    : false;

  const DEFAULT_SLIPPAGE = new BigNumber(defaultSlippage).times(100).toString();

  const allowDecimalsNumber = slippageDecimals ?? 2;

  const regex = new RegExp(
    `^(?:[0-9]+(?:\\${allowDecimalsNumber === 0 ? '' : '.'}[0-9]{0,${allowDecimalsNumber}})?)?$`,
  );

  const handleClickResetSlippage = () => setPercentage(DEFAULT_SLIPPAGE);

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (regex.test(value)) {
      setPercentage(value);
    }
  };

  return (
    <Container>
      <TitleRow>
        <Title>{t('SLIPPAGE')}</Title>
        <ResetButton onClick={handleClickResetSlippage}>{t('RESET_TO_DEFAULT')}</ResetButton>
      </TitleRow>
      <Input
        placeholder={DEFAULT_SLIPPAGE}
        value={percentage}
        onChange={handleOnChange}
        complications={
          <StyledP typography="body_medium_m" color="white_200">
            %
          </StyledP>
        }
        feedback={[
          ...(invalid
            ? [
                {
                  message: t('ERRORS.SLIPPAGE_TOLERANCE_CANNOT_EXCEED'),
                  variant: 'danger' as const,
                },
              ]
            : []),
          ...(!invalid && showSlippageWarning
            ? [
                {
                  message: t('SLIPPAGE_WARNING'),
                  variant: 'warning' as const,
                },
              ]
            : []),
        ]}
        hideClear
        autoFocus
      />
      <Description>{t('SLIPPAGE_DESC')}</Description>
      <Button
        disabled={invalid || result.isZero()}
        variant={invalid ? 'danger' : 'primary'}
        title={t('APPLY')}
        onClick={() => onChange(result.div(100).toNumber())}
      />
    </Container>
  );
}

export default SlippageModalContent;
