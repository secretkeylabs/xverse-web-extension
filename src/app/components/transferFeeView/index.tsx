import AmountWithInscriptionSatribute from '@components/confirmBtcTransaction/itemRow/amountWithInscriptionSatribute';
import { PencilSimple } from '@phosphor-icons/react';
import {
  btcTransaction,
  currencySymbolMap,
  getBtcFiatEquivalent,
  getFiatEquivalent,
} from '@secretkeylabs/xverse-core';
import { StoreState } from '@stores/index';
import { StyledP } from '@ui-library/common.styled';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import Theme from 'theme';

const Container = styled.div((props) => ({
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: '12px 16px',
  marginBottom: 12,
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

interface Props {
  feePerVByte?: BigNumber;
  fee: BigNumber;
  currency: string;
  title?: string;
  inscriptions?: btcTransaction.IOInscription[];
  satributes?: btcTransaction.IOSatribute[];
  customFeeClick?: () => void;
  subtitle?: string;
  onShowInscription?: (inscription: btcTransaction.IOInscription) => void;
}
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

  const { btcFiatRate, stxBtcRate, fiatCurrency } = useSelector(
    (state: StoreState) => state.walletState,
  );
  const fiatRate = getFiatEquivalent(
    Number(fee),
    currency,
    BigNumber(stxBtcRate),
    BigNumber(btcFiatRate),
  );
  const getFiatAmountString = (fiatAmount: BigNumber) => {
    if (!fiatAmount) {
      return '';
    }

    if (fiatAmount.isLessThan(0.01)) {
      return `<${currencySymbolMap[fiatCurrency]}0.01 ${fiatCurrency}`;
    }

    return (
      <NumericFormat
        value={fiatAmount.toFixed(2).toString()}
        displayType="text"
        thousandSeparator
        prefix={`${currencySymbolMap[fiatCurrency]} `}
        suffix={` ${fiatCurrency}`}
        renderText={(value: string) => `~ ${value}`}
      />
    );
  };

  return (
    <Container>
      <Row>
        <FeeTitleContainer>
          <StyledP typography="body_medium_m" color="white_200">
            {title ?? t('FEES')}
          </StyledP>
          {customFeeClick && (
            <CustomRow>
              <StyledP typography="body_medium_m" color="white_400">
                Custom
              </StyledP>
              <EditButton onClick={() => {}}>
                <StyledP typography="body_medium_m" color="tangerine">
                  Edit
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
              <StyledP typography="body_medium_m" color="white_0">
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
            {getFiatAmountString(
              currency === 'sats'
                ? getBtcFiatEquivalent(new BigNumber(fee), BigNumber(btcFiatRate))
                : new BigNumber(fiatRate!),
            )}
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
