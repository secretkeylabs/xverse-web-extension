import { useParsedTxSummaryContext } from '@components/confirmBtcTransaction/hooks/useParsedTxSummaryContext';
import RuneAmount from '@components/confirmBtcTransaction/itemRow/runeAmount';
import { ArrowRight } from '@phosphor-icons/react';
import type { btcTransaction } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import Theme from 'theme';
import Amount from './itemRow/amount';
import InscriptionSatributeRow from './itemRow/inscriptionSatributeRow';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  paddingTop: props.theme.space.m,
  justifyContent: 'center',
  marginBottom: props.theme.space.s,
}));

const RowCenter = styled.div<{ spaceBetween?: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: props.spaceBetween ? 'space-between' : 'initial',
}));

const Header = styled(RowCenter)((props) => ({
  padding: `0 ${props.theme.space.m}`,
}));

const RowContainer = styled.div<{ noPadding?: boolean; noMargin?: boolean }>((props) => ({
  padding: props.noPadding ? 0 : `0 ${props.theme.space.m}`,
  marginTop: props.noMargin ? 0 : `${props.theme.space.m}`,
}));

const AddressLabel = styled(StyledP)((props) => ({
  marginLeft: props.theme.space.xxs,
}));

const BundleHeader = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: props.theme.space.m,
}));

type Props = {
  onShowInscription: (inscription: btcTransaction.IOInscription) => void;
};
function ReceiveSection({ onShowInscription }: Props) {
  const { t } = useTranslation('translation');
  const {
    netBtcAmount,
    showReceiveSection,
    receiveSection: {
      showOrdinalSection,
      showPaymentSection,
      showBtcAmount,
      inscriptionsRareSatsInPayment,
      ordinalRuneReceipts,
      outputsToOrdinal,
      paymentRuneReceipts,
      showOrdinalRunes,
      showPaymentRunes,
    },
  } = useParsedTxSummaryContext();

  if (!showReceiveSection) return null;

  return (
    <>
      {showOrdinalSection && (
        <Container>
          <Header spaceBetween>
            <StyledP typography="body_medium_m" color="white_200">
              {t('CONFIRM_TRANSACTION.YOU_WILL_RECEIVE')}
            </StyledP>
            <RowCenter>
              <ArrowRight weight="bold" color={Theme.colors.white_0} size={16} />
              <AddressLabel typography="body_medium_m">
                {t('CONFIRM_TRANSACTION.YOUR_ORDINAL_ADDRESS')}
              </AddressLabel>
            </RowCenter>
          </Header>
          {showOrdinalRunes &&
            ordinalRuneReceipts.map((receipt) => (
              <RowContainer key={receipt.runeName}>
                <BundleHeader>
                  <div>
                    <StyledP typography="body_medium_m" color="white_400">
                      {t('COMMON.BUNDLE')}
                    </StyledP>
                  </div>
                  <div>
                    <NumericFormat
                      value={546}
                      displayType="text"
                      thousandSeparator
                      prefix={`${t('COMMON.SIZE')}: `}
                      suffix={` ${t('COMMON.SATS')}`}
                      renderText={(value: string) => (
                        <StyledP typography="body_medium_m" color="white_400">
                          {value}
                        </StyledP>
                      )}
                    />
                  </div>
                </BundleHeader>
                <RuneAmount rune={receipt} />
              </RowContainer>
            ))}
          {outputsToOrdinal.length > 0 && (
            <RowContainer>
              {outputsToOrdinal
                .sort((a, b) => b.inscriptions.length - a.inscriptions.length)
                .map((output, index) => (
                  <InscriptionSatributeRow
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    inscriptions={output.inscriptions}
                    satributes={output.satributes}
                    amount={output.amount}
                    showAmount
                    onShowInscription={onShowInscription}
                  />
                ))}
            </RowContainer>
          )}
        </Container>
      )}
      {showPaymentSection && (
        <Container>
          <Header spaceBetween>
            <StyledP typography="body_medium_m" color="white_200">
              {t('CONFIRM_TRANSACTION.YOU_WILL_RECEIVE')}
            </StyledP>
            <RowCenter>
              <ArrowRight weight="bold" color={Theme.colors.white_0} size={16} />
              <AddressLabel typography="body_medium_m">
                {t('CONFIRM_TRANSACTION.YOUR_PAYMENT_ADDRESS')}
              </AddressLabel>
            </RowCenter>
          </Header>
          {showBtcAmount && (
            <RowContainer>
              <Amount amount={netBtcAmount} />
            </RowContainer>
          )}
          {showPaymentRunes &&
            paymentRuneReceipts.map((receipt) => (
              <RowContainer key={receipt.runeName}>
                <BundleHeader>
                  <div>
                    <StyledP typography="body_medium_m" color="white_400">
                      {t('COMMON.BUNDLE')}
                    </StyledP>
                  </div>
                  <div>
                    <NumericFormat
                      value={546}
                      displayType="text"
                      thousandSeparator
                      prefix={`${t('COMMON.SIZE')}: `}
                      suffix={` ${t('COMMON.SATS')}`}
                      renderText={(value: string) => (
                        <StyledP typography="body_medium_m" color="white_400">
                          {value}
                        </StyledP>
                      )}
                    />
                  </div>
                </BundleHeader>
                <RuneAmount rune={receipt} />
              </RowContainer>
            ))}
          {inscriptionsRareSatsInPayment.length > 0 && (
            <RowContainer>
              {inscriptionsRareSatsInPayment
                .sort((a, b) => b.inscriptions.length - a.inscriptions.length)
                .map((output, index) => (
                  <InscriptionSatributeRow
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    inscriptions={output.inscriptions}
                    satributes={output.satributes}
                    amount={output.amount}
                    showAmount
                    onShowInscription={onShowInscription}
                  />
                ))}
            </RowContainer>
          )}
        </Container>
      )}
    </>
  );
}

export default ReceiveSection;
