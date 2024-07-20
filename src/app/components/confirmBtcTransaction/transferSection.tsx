import RuneAmount from '@components/confirmBtcTransaction/itemRow/runeAmount';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { WarningOctagon } from '@phosphor-icons/react';
import { type RuneSummary, btcTransaction } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Divider from '@ui-library/divider';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import Theme from 'theme';
import Amount from './itemRow/amount';
import AmountWithInscriptionSatribute from './itemRow/amountWithInscriptionSatribute';
import InscriptionSatributeRow from './itemRow/inscriptionSatributeRow';
import { getInputsWitAssetsFromUserAddress, getOutputsWithAssetsFromUserAddress } from './utils';

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

const BundleHeader = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: props.theme.space.m,
}));

type Props = {
  outputs: btcTransaction.EnhancedOutput[];
  inputs: btcTransaction.EnhancedInput[];
  hasExternalInputs: boolean;
  transactionIsFinal: boolean;
  runeTransfers?: RuneSummary['transfers'];
  netAmount: number;
  onShowInscription: (inscription: btcTransaction.IOInscription) => void;
};

// if isPartialTransaction, we use inputs instead of outputs
function TransferSection({
  outputs,
  inputs,
  hasExternalInputs,
  transactionIsFinal,
  runeTransfers,
  netAmount,
  onShowInscription,
}: Props) {
  const { t } = useTranslation('translation');
  const { btcAddress, ordinalsAddress } = useSelectedAccount();

  const { inputFromPayment, inputFromOrdinal } = getInputsWitAssetsFromUserAddress({
    inputs,
    btcAddress,
    ordinalsAddress,
  });
  const { outputsFromPayment, outputsFromOrdinal } = getOutputsWithAssetsFromUserAddress({
    outputs,
    btcAddress,
    ordinalsAddress,
  });

  const showAmount = netAmount > 0;

  const inscriptionsFromPayment: btcTransaction.IOInscription[] = [];
  const satributesFromPayment: btcTransaction.IOSatribute[] = [];
  (transactionIsFinal ? outputsFromPayment : inputFromPayment).forEach((item) => {
    inscriptionsFromPayment.push(...item.inscriptions);
    satributesFromPayment.push(...item.satributes);
  });
  // if transaction is not final, then runes will be delegated and will show up in the delegation section
  const hasRuneTransfers = transactionIsFinal && (runeTransfers ?? []).length > 0;
  const hasInscriptionsRareSatsInOrdinal =
    (!transactionIsFinal && inputFromOrdinal.length > 0) || outputsFromOrdinal.length > 0;

  const hasData = showAmount || hasRuneTransfers || hasInscriptionsRareSatsInOrdinal;

  if (!hasData) return null;

  return (
    <>
      <Title>
        {hasExternalInputs
          ? t('CONFIRM_TRANSACTION.YOU_WILL_TRANSFER')
          : t('CONFIRM_TRANSACTION.YOU_WILL_SEND')}
      </Title>
      <Container>
        {showAmount && (
          <RowContainer noMargin>
            <Amount amount={netAmount} />
            <AmountWithInscriptionSatribute
              inscriptions={inscriptionsFromPayment}
              satributes={satributesFromPayment}
              onShowInscription={onShowInscription}
            />
            {hasExternalInputs && (
              <WarningContainer>
                <WarningOctagon weight="fill" color={Theme.colors.caution} size={16} />
                <WarningText typography="body_medium_s" color="caution">
                  {t('CONFIRM_TRANSACTION.BTC_TRANSFER_WARNING')}
                </WarningText>
              </WarningContainer>
            )}
          </RowContainer>
        )}
        {
          // if transaction is not final, then runes will be delegated and will show up in the delegation section
          transactionIsFinal &&
            runeTransfers?.map((transfer, index) => (
              <>
                {index === 0 && <Divider verticalMargin="s" />}
                <RowContainer key={transfer.runeName}>
                  {!hasExternalInputs && (
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
                  <RuneAmount
                    rune={transfer}
                    hasSufficientBalance={transfer.hasSufficientBalance}
                  />
                </RowContainer>
                {runeTransfers.length > index + 1 && <Divider verticalMargin="s" />}
              </>
            ))
        }
        {hasInscriptionsRareSatsInOrdinal && (
          <RowContainer noPadding noMargin={hasRuneTransfers || showAmount}>
            {!transactionIsFinal
              ? inputFromOrdinal.map((input, index) => (
                  <InscriptionSatributeRow
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    hasExternalInputs={hasExternalInputs}
                    inscriptions={input.inscriptions}
                    satributes={input.satributes}
                    amount={input.extendedUtxo.utxo.value}
                    onShowInscription={onShowInscription}
                    showTopDivider={(hasRuneTransfers || showAmount) && index === 0}
                    showBottomDivider={inputFromOrdinal.length > index + 1}
                  />
                ))
              : outputsFromOrdinal.map((output, index) => (
                  <InscriptionSatributeRow
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    hasExternalInputs={hasExternalInputs}
                    inscriptions={output.inscriptions}
                    satributes={output.satributes}
                    amount={output.amount}
                    onShowInscription={onShowInscription}
                    showTopDivider={(hasRuneTransfers || showAmount) && index === 0}
                    showBottomDivider={outputsFromOrdinal.length > index + 1}
                  />
                ))}
          </RowContainer>
        )}
      </Container>
    </>
  );
}

export default TransferSection;
