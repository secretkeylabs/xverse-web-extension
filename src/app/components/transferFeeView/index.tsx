import AmountWithInscriptionSatribute from '@components/confirmBtcTransaction/itemRow/amountWithInscriptionSatribute';
import FiatAmountText from '@components/fiatAmountText';
import useCoinRates from '@hooks/queries/useCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  btcTransaction,
  getBtcFiatEquivalent,
  getFiatEquivalent,
} from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  background: props.theme.colors.elevation1,
  borderRadius: props.theme.radius(2),
  padding: props.theme.space.m,
  marginBottom: props.theme.space.s,
}));

const Row = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
});

const FeeTitleContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const FeeContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignItems: 'flex-end',
});

const FeeRate = styled(StyledP)`
  margin: ${(props) => props.theme.space.xxxs} 0;
`;

type Props = {
  feePerVByte?: BigNumber;
  fee: BigNumber;
  currency: string;
  inscriptions?: btcTransaction.IOInscription[];
  satributes?: btcTransaction.IOSatribute[];
  onShowInscription?: (inscription: btcTransaction.IOInscription) => void;
};

function TransferFeeView({
  feePerVByte,
  fee,
  currency,
  inscriptions = [],
  satributes = [],
  onShowInscription = () => {},
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { t: tUnits } = useTranslation('translation', { keyPrefix: 'UNITS' });

  const { fiatCurrency } = useWalletSelector();
  const { btcFiatRate, stxBtcRate } = useCoinRates();

  return (
    <Container>
      <Row>
        <FeeTitleContainer>
          <StyledP typography="body_medium_m" color="white_0">
            {t('NETWORK_FEE')}
          </StyledP>
        </FeeTitleContainer>
        <FeeContainer>
          <NumericFormat
            value={fee.toString()}
            displayType="text"
            thousandSeparator
            suffix={` ${currency}`}
            renderText={(value: string) => (
              <StyledP data-testid="send-value" typography="body_medium_m" color="white_0">
                {value}
              </StyledP>
            )}
          />
          {currency === 'sats' && feePerVByte && (
            <NumericFormat
              value={feePerVByte?.toString()}
              displayType="text"
              thousandSeparator
              suffix={` ${tUnits('SATS_PER_VB')}`}
              renderText={(value: string) => (
                <FeeRate typography="body_medium_s" color="white_400">
                  {value}
                </FeeRate>
              )}
            />
          )}
          <StyledP typography="body_medium_s" color="white_400">
            <FiatAmountText
              fiatAmount={
                currency === 'sats'
                  ? getBtcFiatEquivalent(BigNumber(fee), BigNumber(btcFiatRate))
                  : BigNumber(
                      getFiatEquivalent(
                        Number(fee),
                        'STX',
                        BigNumber(stxBtcRate),
                        BigNumber(btcFiatRate),
                      )!,
                    )
              }
              fiatCurrency={fiatCurrency}
            />
          </StyledP>
        </FeeContainer>
      </Row>
      <AmountWithInscriptionSatribute
        inscriptions={inscriptions}
        satributes={satributes}
        onShowInscription={onShowInscription}
      />
    </Container>
  );
}

export default TransferFeeView;
