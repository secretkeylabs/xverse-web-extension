import { useParsedTxSummaryContext } from '@components/confirmBtcTransaction/hooks/useParsedTxSummaryContext';
import RuneAmount from '@components/confirmBtcTransaction/itemRow/runeAmount';
import { WarningOctagon } from '@phosphor-icons/react';
import { type btcTransaction } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Divider from '@ui-library/divider';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from 'theme';
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
  paddingTop: props.theme.space.m,
  justifyContent: 'center',
  marginBottom: props.theme.space.s,
}));

const RowContainer = styled.div<{ noPadding?: boolean; noMargin?: boolean }>((props) => ({
  padding: props.noPadding ? 0 : `0 ${props.theme.space.m}`,
}));

const WarningContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: props.theme.space.xs,
  marginTop: props.theme.space.s,
}));

const WarningText = styled(StyledP)`
  flex: 1 0 0;
`;

type Props = { onShowInscription: (inscription: btcTransaction.IOInscription) => void };

function TransferSection({ onShowInscription }: Props) {
  const { t } = useTranslation('translation');
  const {
    runeSummary,
    netBtcAmount,
    showTransferSection,
    transactionIsFinal,
    transferSection: {
      showBtcAmount,
      showRuneTransfers,
      outputsFromOrdinal,
      inputsFromOrdinal,
      inscriptionsFromPayment,
      satributesFromPayment,
    },
  } = useParsedTxSummaryContext();

  if (!showTransferSection) return null;

  return (
    <>
      <Title>{t('CONFIRM_TRANSACTION.YOU_WILL_TRANSFER')}</Title>
      <Container>
        <RowContainer noMargin>
          {showBtcAmount && (
            <>
              <Amount amount={-netBtcAmount} />
              <AmountWithInscriptionSatribute
                inscriptions={inscriptionsFromPayment}
                satributes={satributesFromPayment}
                onShowInscription={onShowInscription}
              />
              <WarningContainer>
                <WarningOctagon weight="fill" color={Theme.colors.caution} size={16} />
                <WarningText typography="body_medium_s" color="caution">
                  {t('CONFIRM_TRANSACTION.BTC_TRANSFER_WARNING')}
                </WarningText>
              </WarningContainer>
            </>
          )}
          {showRuneTransfers &&
            runeSummary?.transfers?.map((transfer, index) => (
              <>
                {showBtcAmount && index === 0 && <Divider verticalMargin="s" />}
                <RuneAmount rune={transfer} hasSufficientBalance={transfer.hasSufficientBalance} />
                {runeSummary?.transfers.length > index + 1 && <Divider verticalMargin="s" />}
              </>
            ))}
          {transactionIsFinal
            ? outputsFromOrdinal.map((output, index) => (
                <>
                  {(showRuneTransfers || showBtcAmount) && index === 0 && (
                    <Divider verticalMargin="s" />
                  )}
                  <InscriptionSatributeRow
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    inscriptions={output.inscriptions}
                    satributes={output.satributes}
                    amount={output.amount}
                    onShowInscription={onShowInscription}
                  />
                  {outputsFromOrdinal.length > index + 1 && <Divider verticalMargin="s" />}
                </>
              ))
            : inputsFromOrdinal.map((input, index) => (
                <>
                  {(showRuneTransfers || showBtcAmount) && index === 0 && (
                    <Divider verticalMargin="s" />
                  )}
                  <InscriptionSatributeRow
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    inscriptions={input.inscriptions}
                    satributes={input.satributes}
                    amount={input.extendedUtxo.utxo.value}
                    onShowInscription={onShowInscription}
                  />
                  {inputsFromOrdinal.length > index + 1 && <Divider verticalMargin="s" />}
                </>
              ))}
        </RowContainer>
      </Container>
    </>
  );
}

export default TransferSection;
