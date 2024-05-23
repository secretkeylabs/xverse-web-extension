import RuneAmount from '@components/confirmBtcTransaction/itemRow/runeAmount';
import useWalletSelector from '@hooks/useWalletSelector';
import { btcTransaction, RuneSummary } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Amount from './itemRow/amount';
import AmountWithInscriptionSatribute from './itemRow/amountWithInscriptionSatribute';
import InscriptionSatributeRow from './itemRow/inscriptionSatributeRow';
import { getInputsWitAssetsFromUserAddress, getOutputsWithAssetsFromUserAddress } from './utils';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: `${props.theme.space.m} 0`,
  justifyContent: 'center',
  marginBottom: props.theme.space.s,
}));

const RowContainer = styled.div<{ noPadding?: boolean; noMargin?: boolean }>((props) => ({
  padding: props.noPadding ? 0 : `0 ${props.theme.space.m}`,
  marginTop: props.noMargin ? 0 : `${props.theme.space.m}`,
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

type Props = {
  outputs: btcTransaction.EnhancedOutput[];
  inputs: btcTransaction.EnhancedInput[];
  transactionIsFinal: boolean;
  runeTransfers?: RuneSummary['transfers'];
  netAmount: number;
  onShowInscription: (inscription: btcTransaction.IOInscription) => void;
};

// if isPartialTransaction, we use inputs instead of outputs
function TransferSection({
  outputs,
  inputs,
  transactionIsFinal,
  runeTransfers,
  netAmount,
  onShowInscription,
}: Props) {
  const { btcAddress, ordinalsAddress } = useWalletSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

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
    <Container>
      <Header spaceBetween>
        <StyledP typography="body_medium_m" color="white_200">
          {t('YOU_WILL_TRANSFER')}
        </StyledP>
      </Header>
      {
        // if transaction is not final, then runes will be delegated and will show up in the delegation section
        transactionIsFinal &&
          runeTransfers?.map((transfer) => (
            <RowContainer key={transfer.runeName}>
              <RuneAmount rune={transfer} hasSufficientBalance={transfer.hasSufficientBalance} />
            </RowContainer>
          ))
      }
      {showAmount && (
        <RowContainer>
          <Amount amount={netAmount} />
          <AmountWithInscriptionSatribute
            inscriptions={inscriptionsFromPayment}
            satributes={satributesFromPayment}
            onShowInscription={onShowInscription}
          />
        </RowContainer>
      )}
      {hasInscriptionsRareSatsInOrdinal && (
        <RowContainer noPadding noMargin={hasRuneTransfers || showAmount}>
          {!transactionIsFinal
            ? inputFromOrdinal.map((input, index) => (
                <InscriptionSatributeRow
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
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
  );
}

export default TransferSection;
