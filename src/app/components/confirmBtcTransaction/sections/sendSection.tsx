import type { btcTransaction, RareSatsType } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { getTruncatedAddress } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
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
  borderRadius: props.theme.radius(2),
  paddingTop: props.theme.space.m,
  justifyContent: 'center',
  marginBottom: props.theme.space.s,
}));

const RowContainer = styled.div<{ noPadding?: boolean; noMargin?: boolean }>((props) => ({
  padding: props.noPadding ? 0 : `0 ${props.theme.space.m}`,
  marginBottom: props.noMargin ? 0 : props.theme.space.m,
}));

const SubHeader = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: props.theme.space.s,
}));

function SendSection({
  onShowInscription,
}: {
  onShowInscription: (
    inscription:
      | (btcTransaction.IOInscription & { satributes: RareSatsType[] })
      | (Omit<btcTransaction.IOInscription, 'offset'> & { satributes: RareSatsType[] }),
  ) => void;
}) {
  const { t } = useTranslation('translation');

  const { extractedTxSummary } = useTxSummaryContext();

  if (extractedTxSummary.type !== 'user' || !extractedTxSummary.transfers.length) return null;

  return (
    <>
      <Title>{t('CONFIRM_TRANSACTION.YOU_WILL_SEND')}</Title>
      {extractedTxSummary.transfers.map((transfer) => (
        <Container key={transfer.scriptHex}>
          <RowContainer noMargin>
            <SubHeader>
              <StyledP typography="body_medium_m" color="white_400">
                {t('COMMON.TO')}
              </StyledP>
              <StyledP typography="body_medium_m" color="white_0">
                {/* TODO - clarify what to display when not an address type */}
                {transfer.address
                  ? getTruncatedAddress(transfer.address, 6)
                  : transfer.destinationType}
              </StyledP>
            </SubHeader>
            {transfer.btcSatsAmount > 0 && (
              <>
                <Amount amount={transfer.btcSatsAmount} />
                <AmountWithInscriptionSatribute
                  inscriptions={[]}
                  satributes={[]}
                  onShowInscription={onShowInscription}
                />
              </>
            )}
            {transfer.bundles.map((bundle) => (
              <>
                <SubHeader>
                  <StyledP typography="body_medium_m" color="white_400">
                    {t('COMMON.BUNDLE')}
                  </StyledP>
                  <NumericFormat
                    value={bundle.amount}
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
                </SubHeader>
                {bundle.runes.map((runeTransfer, i) => (
                  <RuneAmount
                    key={runeTransfer.runeId}
                    rune={runeTransfer}
                    topMargin={i === 0 && transfer.btcSatsAmount > 0}
                    hasSufficientBalance
                  />
                ))}
                <InscriptionSatributeRow
                  bundleSize={bundle.amount}
                  inscriptions={bundle.inscriptions}
                  satributes={bundle.satributes}
                  onShowInscription={onShowInscription}
                />
              </>
            ))}
          </RowContainer>
        </Container>
      ))}
    </>
  );
}

export default SendSection;
