import { useParsedTxSummaryContext } from '@components/confirmBtcTransaction/hooks/useParsedTxSummaryContext';
import RuneAmount from '@components/confirmBtcTransaction/itemRow/runeAmount';
import type { btcTransaction } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Divider from '@ui-library/divider';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import Amount from './itemRow/amount';
import AmountWithInscriptionSatribute from './itemRow/amountWithInscriptionSatribute';
import InscriptionSatributeRow from './itemRow/inscriptionSatributeRow';

const Title = styled.p`
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_200};
  margin-top: ${(props) => props.theme.space.s};
  margin-bottom: ${(props) => props.theme.space.xs};
`;

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: props.theme.radius(2),
  padding: `${props.theme.space.m} 0 20px`,
  justifyContent: 'center',
  marginBottom: props.theme.space.s,
}));

const RowContainer = styled.div<{ noPadding?: boolean; noMargin?: boolean }>((props) => ({
  padding: props.noPadding ? 0 : `0 ${props.theme.space.m}`,
}));

const BundleHeader = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: props.theme.space.m,
}));

function SendSection({
  onShowInscription,
}: {
  onShowInscription: (inscription: btcTransaction.IOInscription) => void;
}) {
  const { t } = useTranslation('translation');
  const {
    runeSummary,
    netBtcAmount,
    transactionIsFinal,
    sendSection: {
      showSendSection,
      showBtcAmount,
      showRuneTransfers,
      hasInscriptionsRareSatsInOrdinal,
      outputsFromOrdinal,
      inputFromOrdinal,
      inscriptionsFromPayment,
      satributesFromPayment,
    },
  } = useParsedTxSummaryContext();

  /** TODO - start bundling send/receive data by output addresses
   * switch(output.type) === 'address' -> display `destinationAddress`
   * script -> OP_RETURN
   * ms -> nothing
   * Each address can have 1:N bundles
   * Challenge right now is how to to group the btc, runes, inscriptions data together by output address
   */

  /** Send Data
   * BTC: netBtcAmount
   * Runes: runeSummary.transfers
   * Ordinals: outputsFromOrdinal OR inputFromOrdinal (depending if tx is final)
   */

  if (!showSendSection) return null;

  return (
    <>
      <Title>{t('CONFIRM_TRANSACTION.YOU_WILL_SEND')}</Title>
      <Container>
        {showBtcAmount && (
          <RowContainer noMargin>
            <Amount amount={-netBtcAmount} />
            <AmountWithInscriptionSatribute
              inscriptions={inscriptionsFromPayment}
              satributes={satributesFromPayment}
              onShowInscription={onShowInscription}
            />
          </RowContainer>
        )}
        {showRuneTransfers &&
          runeSummary?.transfers?.map((transfer, index) => (
            <>
              {showBtcAmount && <Divider verticalMargin="s" />}
              <RowContainer key={transfer.runeName}>
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
                <RuneAmount rune={transfer} hasSufficientBalance={transfer.hasSufficientBalance} />
              </RowContainer>
              {runeSummary?.transfers.length > index + 1 && <Divider verticalMargin="s" />}
            </>
          ))}
        {hasInscriptionsRareSatsInOrdinal && (
          <RowContainer noPadding noMargin={showRuneTransfers || showBtcAmount}>
            {transactionIsFinal
              ? outputsFromOrdinal.map((output, index) => (
                  <InscriptionSatributeRow
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    hasExternalInputs={false}
                    inscriptions={output.inscriptions}
                    satributes={output.satributes}
                    amount={output.amount}
                    onShowInscription={onShowInscription}
                    showTopDivider={(showRuneTransfers || showBtcAmount) && index === 0}
                    showBottomDivider={outputsFromOrdinal.length > index + 1}
                  />
                ))
              : inputFromOrdinal.map((input, index) => (
                  <InscriptionSatributeRow
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    hasExternalInputs={false}
                    inscriptions={input.inscriptions}
                    satributes={input.satributes}
                    amount={input.extendedUtxo.utxo.value}
                    onShowInscription={onShowInscription}
                    showTopDivider={(showRuneTransfers || showBtcAmount) && index === 0}
                    showBottomDivider={inputFromOrdinal.length > index + 1}
                  />
                ))}
          </RowContainer>
        )}
      </Container>
    </>
  );
}

export default SendSection;
