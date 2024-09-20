import useSelectedAccount from '@hooks/useSelectedAccount';
import type {
  AggregatedOutputSummary,
  btcTransaction,
  RareSatsType,
} from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useTxSummaryContext } from '../hooks/useTxSummaryContext';
import Amount from '../itemRow/amount';
import AmountWithInscriptionSatribute from '../itemRow/amountWithInscriptionSatribute';
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
  borderRadius: 12,
  paddingTop: props.theme.space.m,
  justifyContent: 'center',
  marginBottom: props.theme.space.s,
}));

const SubHeader = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: props.theme.space.s,
}));

const RowContainer = styled.div<{ noPadding?: boolean; noMargin?: boolean }>((props) => ({
  padding: props.noPadding ? 0 : `0 ${props.theme.space.m}`,
  marginBottom: props.noMargin ? 0 : props.theme.space.m,
}));

type Props = {
  onShowInscription: (
    inscription:
      | (btcTransaction.IOInscription & { satributes: RareSatsType[] })
      | (Omit<btcTransaction.IOInscription, 'offset'> & { satributes: RareSatsType[] }),
  ) => void;
};

function ReceiveSection({ onShowInscription }: Props) {
  const { t } = useTranslation('translation');
  const { extractedTxSummary } = useTxSummaryContext();
  const { ordinalsAddress, btcAddress } = useSelectedAccount();
  const txIsFinal = extractedTxSummary.isFinal;

  const extractReceiveDetails = (address: string, receive: AggregatedOutputSummary) => {
    const { btcSatsAmount, inscriptions, satributes, runes } = receive;

    const showReceipts =
      btcSatsAmount > 0 || inscriptions.length || satributes.length || runes.length;

    if (!showReceipts) {
      return null;
    }

    return (
      <>
        <Title>{t('CONFIRM_TRANSACTION.YOU_WILL_RECEIVE')}</Title>
        <Container>
          <RowContainer noMargin>
            <SubHeader>
              <StyledP typography="body_medium_m" color="white_400">
                {t('COMMON.TO')}
              </StyledP>
              <StyledP typography="body_medium_m" color="white_0">
                {address === btcAddress && t('CONFIRM_TRANSACTION.YOUR_PAYMENT_ADDRESS')}
                {address === ordinalsAddress && t('CONFIRM_TRANSACTION.YOUR_ORDINAL_ADDRESS')}
              </StyledP>
            </SubHeader>
            {btcSatsAmount > 0 && (
              <RowContainer
                noPadding
                noMargin={!runes.length && !inscriptions.length && !satributes.length}
              >
                <Amount amount={btcSatsAmount} />
                <AmountWithInscriptionSatribute
                  inscriptions={inscriptions}
                  satributes={satributes}
                  onShowInscription={onShowInscription}
                />
              </RowContainer>
            )}
            {txIsFinal &&
              runes.map((receipt) => (
                <RowContainer
                  noPadding
                  noMargin={!inscriptions.length && !satributes.length}
                  key={receipt.runeName}
                >
                  <RuneAmount rune={receipt} />
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
      {extractedTxSummary.type === 'user' && (
        <>
          {extractReceiveDetails(ordinalsAddress, extractedTxSummary.ordinalsAddressReceipts)}
          {extractReceiveDetails(btcAddress, extractedTxSummary.paymentsAddressReceipts)}
        </>
      )}
      {extractedTxSummary.type === 'aggregated' && (
        <>
          {extractReceiveDetails(ordinalsAddress, extractedTxSummary.receipts[ordinalsAddress])}
          {extractReceiveDetails(btcAddress, extractedTxSummary.receipts[btcAddress])}
        </>
      )}
    </>
  );
}

export default ReceiveSection;
