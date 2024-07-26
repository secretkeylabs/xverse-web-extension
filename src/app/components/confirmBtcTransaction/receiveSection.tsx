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
  padding: `${props.theme.space.m} 0`,
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
    hasExternalInputs,
    netBtcAmount,
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

  /** TODO - start bundling send/receive data by output addresses
   * switch(output.type) === 'address' -> display `destinationAddress`
   * script -> OP_RETURN
   * ms -> nothing
   * Each address can have 1:N bundles
   * Challenge right now is how to to group the btc, runes, inscriptions data together by output address
   */

  /** Receive Data
   * BTC: netBtcAmount
   * Runes: paymentRuneReceipts
   * Ordinals: ordinalRuneReceipts & outputsToOrdinal
   * Rare Sats: inscriptionsRareSatsInPayment
   */

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
                {hasExternalInputs && (
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
                )}
                <RuneAmount rune={receipt} />
              </RowContainer>
            ))}
          {outputsToOrdinal.length > 0 && (
            <RowContainer noPadding noMargin={Boolean(ordinalRuneReceipts.length)}>
              {outputsToOrdinal
                .sort((a, b) => b.inscriptions.length - a.inscriptions.length)
                .map((output, index) => (
                  <InscriptionSatributeRow
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    inscriptions={output.inscriptions}
                    hasExternalInputs={hasExternalInputs}
                    satributes={output.satributes}
                    amount={output.amount}
                    onShowInscription={onShowInscription}
                    showTopDivider={Boolean(ordinalRuneReceipts.length) && index === 0}
                    showBottomDivider={outputsToOrdinal.length > index + 1}
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
          {showPaymentRunes &&
            paymentRuneReceipts.map((receipt) => (
              <RowContainer key={receipt.runeName}>
                <RuneAmount rune={receipt} />
              </RowContainer>
            ))}
          {showBtcAmount && (
            <RowContainer>
              <Amount amount={netBtcAmount} />
            </RowContainer>
          )}
          {inscriptionsRareSatsInPayment.length > 0 && (
            <RowContainer noPadding noMargin={Boolean(paymentRuneReceipts.length) || showBtcAmount}>
              {inscriptionsRareSatsInPayment
                .sort((a, b) => b.inscriptions.length - a.inscriptions.length)
                .map((output, index) => (
                  <InscriptionSatributeRow
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    inscriptions={output.inscriptions}
                    hasExternalInputs={hasExternalInputs}
                    satributes={output.satributes}
                    amount={output.amount}
                    onShowInscription={onShowInscription}
                    showTopDivider={
                      (Boolean(paymentRuneReceipts.length) || showBtcAmount) && index === 0
                    }
                    showBottomDivider={inscriptionsRareSatsInPayment.length > index + 1}
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
