import AmountWithInscriptionSatribute from '@components/confirmBtcTransaction/itemRow/amountWithInscriptionSatribute';
import FiatAmountText from '@components/fiatAmountText';
import useCoinRates from '@hooks/queries/useCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { PencilSimple } from '@phosphor-icons/react';
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
import Theme from 'theme';

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

const CustomRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const EditButton = styled.button`
  display: flex;
  flex-direction: row;
  background: transparent;
  align-items: center;
  gap: ${(props) => props.theme.space.xxs};
  cursor: ${(props) => (props.onClick ? 'pointer' : 'initial')};
  width: 100%;
  margin-left: ${(props) => props.theme.space.xs};
`;

type Props = {
  feePerVByte?: BigNumber;
  fee: BigNumber;
  currency: string;
  title?: string;
  inscriptions?: btcTransaction.IOInscription[];
  satributes?: btcTransaction.IOSatribute[];
  customFeeClick?: () => void;
  subtitle?: string;
  onShowInscription?: (inscription: btcTransaction.IOInscription) => void;
};

function TransferFeeView({
  feePerVByte,
  fee,
  currency,
  title,
  inscriptions = [],
  satributes = [],
  customFeeClick,
  subtitle,
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
            {title ?? t('NETWORK_FEE')}
          </StyledP>
          {customFeeClick && (
            <CustomRow>
              <StyledP typography="body_medium_m" color="white_400">
                {t('CUSTOM')}
              </StyledP>
              <EditButton onClick={() => {}}>
                <StyledP typography="body_medium_m" color="tangerine">
                  {t('EDIT')}
                </StyledP>
                <PencilSimple size="16" color={Theme.colors.tangerine} weight="fill" />
              </EditButton>
            </CustomRow>
          )}
          {subtitle && (
            <StyledP typography="body_s" color="white_400">
              {subtitle}
            </StyledP>
          )}
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
                <StyledP typography="body_s" color="white_400">
                  {value}
                </StyledP>
              )}
            />
          )}
          <StyledP typography="body_s" color="white_400">
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
