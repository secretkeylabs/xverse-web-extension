import RuneAmount from '@components/confirmBtcTransaction/itemRow/runeAmount';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowRight } from '@phosphor-icons/react';
import type { btcTransaction, RuneSummary } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import Theme from 'theme';
import Amount from './itemRow/amount';
import InscriptionSatributeRow from './itemRow/inscriptionSatributeRow';
import { getOutputsWithAssetsToUserAddress } from './utils';

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
  outputs: btcTransaction.EnhancedOutput[];
  hasExternalInputs: boolean;
  netAmount: number;
  transactionIsFinal: boolean;
  onShowInscription: (inscription: btcTransaction.IOInscription) => void;
  runeReceipts?: RuneSummary['receipts'];
};
function ReceiveSection({
  outputs,
  hasExternalInputs,
  netAmount,
  onShowInscription,
  runeReceipts,
  transactionIsFinal,
}: Props) {
  const { btcAddress, ordinalsAddress } = useSelectedAccount();
  const { hasActivatedRareSatsKey } = useWalletSelector();
  const { t } = useTranslation('translation');

  const { outputsToPayment, outputsToOrdinal } = getOutputsWithAssetsToUserAddress({
    outputs,
    btcAddress,
    ordinalsAddress,
  });

  // if receiving runes from own addresses, hide it because it is change, unless it swap addresses (recover runes)
  const filteredRuneReceipts =
    runeReceipts?.filter(
      (receipt) =>
        !receipt.sourceAddresses.some(
          (address) =>
            (address === ordinalsAddress && receipt.destinationAddress === ordinalsAddress) ||
            (address === btcAddress && receipt.destinationAddress === btcAddress),
        ),
    ) ?? [];
  const ordinalRuneReceipts = filteredRuneReceipts.filter(
    (receipt) => receipt.destinationAddress === ordinalsAddress,
  );
  const paymentRuneReceipts = filteredRuneReceipts.filter(
    (receipt) => receipt.destinationAddress === btcAddress,
  );

  const inscriptionsRareSatsInPayment = outputsToPayment.filter(
    (output) =>
      output.inscriptions.length > 0 || (hasActivatedRareSatsKey && output.satributes.length > 0),
  );
  const areInscriptionsRareSatsInPayment = inscriptionsRareSatsInPayment.length > 0;
  const areInscriptionRareSatsInOrdinal = outputsToOrdinal.length > 0;
  const amountIsBiggerThanZero = netAmount > 0;

  // if transaction is not final, then runes will be delegated and will show up in the delegation section
  const showOrdinalRunes = !!(transactionIsFinal && ordinalRuneReceipts.length);
  const showOrdinalSection = showOrdinalRunes || areInscriptionRareSatsInOrdinal;

  // if transaction is not final, then runes will be delegated and will show up in the delegation section
  const showPaymentRunes = !!(transactionIsFinal && paymentRuneReceipts.length);
  const showPaymentSection =
    amountIsBiggerThanZero || showPaymentRunes || areInscriptionsRareSatsInPayment;

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
          {areInscriptionRareSatsInOrdinal && (
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
          {amountIsBiggerThanZero && (
            <RowContainer>
              <Amount amount={netAmount} />
            </RowContainer>
          )}
          {areInscriptionsRareSatsInPayment && (
            <RowContainer
              noPadding
              noMargin={Boolean(paymentRuneReceipts.length) || amountIsBiggerThanZero}
            >
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
                      (Boolean(paymentRuneReceipts.length) || amountIsBiggerThanZero) && index === 0
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
