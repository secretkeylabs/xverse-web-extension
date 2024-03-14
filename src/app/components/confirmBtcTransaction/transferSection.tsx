import RuneAmount from '@components/confirmBtcTransaction/itemRow/runeAmount';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowRight } from '@phosphor-icons/react';
import { btcTransaction, FungibleToken } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { getTruncatedAddress } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from '../../../theme';
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

const RowContainer = styled.div((props) => ({
  padding: `0 ${props.theme.space.m}`,
}));

const RowCenter = styled.div<{ spaceBetween?: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: props.spaceBetween ? 'space-between' : 'initial',
}));

const Header = styled(RowCenter)((props) => ({
  marginBottom: props.theme.space.m,
  padding: `0 ${props.theme.space.m}`,
}));

const StyledStyledP = styled(StyledP)`
  display: flex;
  align-items: center;
`;

const StyledArrowRight = styled(ArrowRight)({
  marginRight: 4,
});

type Props = {
  outputs: btcTransaction.EnhancedOutput[];
  inputs: btcTransaction.EnhancedInput[];
  isPartialTransaction: boolean;
  netAmount: number;
  onShowInscription: (inscription: btcTransaction.IOInscription) => void;
  token?: FungibleToken;
  amountToSend?: string;
  recipientAddress?: string;
};

// if isPartialTransaction, we use inputs instead of outputs
function TransferSection({
  outputs,
  inputs,
  isPartialTransaction,
  netAmount,
  onShowInscription,
  token,
  amountToSend,
  recipientAddress,
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
  (isPartialTransaction ? inputFromPayment : outputsFromPayment).forEach((item) => {
    inscriptionsFromPayment.push(...item.inscriptions);
    satributesFromPayment.push(...item.satributes);
  });

  const hasData =
    showAmount ||
    (isPartialTransaction && inputFromOrdinal.length > 0) ||
    outputsFromOrdinal.length > 0;

  if (!hasData) return null;

  const isRuneTransaction = token && amountToSend && recipientAddress;

  return (
    <Container>
      <Header spaceBetween>
        <StyledP typography="body_medium_m" color="white_200">
          {t('YOU_WILL_TRANSFER')}
        </StyledP>
        {isRuneTransaction && (
          <StyledStyledP typography="body_medium_m" color="white_200">
            <StyledArrowRight weight="bold" color={Theme.colors.white_0} size={16} />
            {getTruncatedAddress(recipientAddress, 6)}
          </StyledStyledP>
        )}
      </Header>
      {showAmount && (
        <RowContainer>
          {isRuneTransaction && (
            <RuneAmount amountSats={546} token={token} amountToSend={amountToSend} />
          )}
          {!isRuneTransaction && <Amount amount={netAmount} />}
          <AmountWithInscriptionSatribute
            inscriptions={inscriptionsFromPayment}
            satributes={satributesFromPayment}
            onShowInscription={onShowInscription}
          />
        </RowContainer>
      )}
      {isPartialTransaction
        ? inputFromOrdinal.map((input, index) => (
            <InscriptionSatributeRow
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              inscriptions={input.inscriptions}
              satributes={input.satributes}
              amount={input.extendedUtxo.utxo.value}
              onShowInscription={onShowInscription}
              showTopDivider={showAmount && index === 0}
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
              showTopDivider={showAmount && index === 0}
              showBottomDivider={outputsFromOrdinal.length > index + 1}
            />
          ))}
    </Container>
  );
}

export default TransferSection;
