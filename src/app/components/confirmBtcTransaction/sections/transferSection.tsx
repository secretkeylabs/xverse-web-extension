import useSelectedAccount from '@hooks/useSelectedAccount';
import { WarningOctagon } from '@phosphor-icons/react';
import type {
  AggregatedInputSummary,
  btcTransaction,
  RareSatsType,
} from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from '../../../../theme';
import { useTxSummaryContext } from '../hooks/useTxSummaryContext';
import Amount from '../itemRow/amount';
import InscriptionSatributeRow from '../itemRow/inscriptionSatributeRow';
import RuneAmount from '../itemRow/runeAmount';

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
  marginBottom: props.noMargin ? 0 : props.theme.space.m,
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

const SubHeader = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: props.theme.space.s,
}));

type Props = {
  onShowInscription: (
    inscription:
      | (btcTransaction.IOInscription & { satributes: RareSatsType[] })
      | (Omit<btcTransaction.IOInscription, 'offset'> & { satributes: RareSatsType[] }),
  ) => void;
};

function TransferSection({ onShowInscription }: Props) {
  const { btcAddress, ordinalsAddress } = useSelectedAccount();
  const { t } = useTranslation('translation');
  const { extractedTxSummary } = useTxSummaryContext();

  if (
    extractedTxSummary.type !== 'aggregated' ||
    !Object.values(extractedTxSummary.transfers).length
  ) {
    return null;
  }

  const txIsFinal = extractedTxSummary.isFinal;

  const extractTransferDetails = (address: string, transfer: AggregatedInputSummary) => {
    const { btcSatsAmount, inscriptions, satributes, runes } = transfer;

    const showTransfers =
      (txIsFinal && btcSatsAmount > 0) ||
      inscriptions.length ||
      satributes.length ||
      (txIsFinal && runes.length);

    if (!showTransfers) return null;

    return (
      <>
        <Title>{t('CONFIRM_TRANSACTION.YOU_WILL_TRANSFER')}</Title>
        <Container>
          <RowContainer noMargin>
            <SubHeader>
              <StyledP typography="body_medium_m" color="white_400">
                {t('COMMON.FROM')}
              </StyledP>
              <StyledP typography="body_medium_m" color="white_0">
                {address === btcAddress && t('CONFIRM_TRANSACTION.YOUR_PAYMENT_ADDRESS')}
                {address === ordinalsAddress && t('CONFIRM_TRANSACTION.YOUR_ORDINAL_ADDRESS')}
              </StyledP>
            </SubHeader>
            {txIsFinal && btcSatsAmount > 0 && (
              <RowContainer
                noPadding
                noMargin={!runes.length && !inscriptions.length && !satributes.length}
              >
                <Amount amount={btcSatsAmount} />
                <WarningContainer>
                  <WarningOctagon weight="fill" color={Theme.colors.caution} size={16} />
                  <WarningText typography="body_medium_s" color="caution">
                    {t('CONFIRM_TRANSACTION.BTC_TRANSFER_WARNING')}
                  </WarningText>
                </WarningContainer>
              </RowContainer>
            )}
            {txIsFinal &&
              runes.map((runeTransfer) => (
                <RowContainer
                  key={runeTransfer.runeName}
                  noPadding
                  noMargin={!inscriptions.length && !satributes.length}
                >
                  <RuneAmount rune={runeTransfer} hasSufficientBalance />
                </RowContainer>
              ))}
            <InscriptionSatributeRow
              inscriptions={inscriptions}
              satributes={satributes}
              onShowInscription={onShowInscription}
            />
          </RowContainer>
        </Container>
      </>
    );
  };

  return (
    <>
      {extractedTxSummary.transfers[btcAddress] &&
        extractTransferDetails(btcAddress, extractedTxSummary.transfers[btcAddress])}
      {extractedTxSummary.transfers[ordinalsAddress] &&
        extractTransferDetails(ordinalsAddress, extractedTxSummary.transfers[ordinalsAddress])}
    </>
  );
}

export default TransferSection;
