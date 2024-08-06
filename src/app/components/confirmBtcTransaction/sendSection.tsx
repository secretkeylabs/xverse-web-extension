import { useParsedTxSummaryContext } from '@components/confirmBtcTransaction/hooks/useParsedTxSummaryContext';
import RuneAmount from '@components/confirmBtcTransaction/itemRow/runeAmount';
import type { btcTransaction } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { getTruncatedAddress } from '@utils/helper';
import { useTranslation } from 'react-i18next';
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
  paddingTop: props.theme.space.m,
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
  marginBottom: props.theme.space.s,
}));

function SendSection({
  onShowInscription,
}: {
  onShowInscription: (inscription: btcTransaction.IOInscription) => void;
}) {
  const { t } = useTranslation('translation');
  const {
    showSendSection,
    sendSection: { bundledOutputs, inscriptionsFromPayment, satributesFromPayment },
  } = useParsedTxSummaryContext();

  if (!showSendSection || !Object.entries(bundledOutputs).length) return null;

  return (
    <>
      <Title>{t('CONFIRM_TRANSACTION.YOU_WILL_SEND')}</Title>
      {Object.entries(bundledOutputs).map(([address, bundle], index) => (
        <Container key={address}>
          <RowContainer key={address} noMargin>
            <BundleHeader>
              <StyledP typography="body_medium_m" color="white_400">
                {t('COMMON.TO')}
              </StyledP>
              <StyledP typography="body_medium_m" color="white_0">
                {getTruncatedAddress(address, 6)}
              </StyledP>
            </BundleHeader>
            <Amount amount={bundle.netBtcAmount} />
            <AmountWithInscriptionSatribute
              inscriptions={inscriptionsFromPayment}
              satributes={satributesFromPayment}
              onShowInscription={onShowInscription}
            />
            {bundle.runeTransfers.map((runeTransfer, i) => (
              <RuneAmount
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                rune={runeTransfer}
                topMargin={i === 0 && bundle.netBtcAmount > 0}
                hasSufficientBalance={runeTransfer.hasSufficientBalance}
              />
            ))}
            {bundle.outputs.map((output) => (
              <InscriptionSatributeRow
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                inscriptions={output.inscriptions}
                satributes={output.satributes}
                amount={output.amount}
                topMargin={bundle.netBtcAmount > 0 || bundle.runeTransfers.length > 0}
                showAmount
                onShowInscription={onShowInscription}
              />
            ))}
          </RowContainer>
        </Container>
      ))}
    </>
  );
}

export default SendSection;
