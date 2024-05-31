import ScriptIcon from '@assets/img/transactions/ScriptIcon.svg';
import OutputIcon from '@assets/img/transactions/output.svg';
import TransferDetailView from '@components/transferDetailView';
import useWalletSelector from '@hooks/useWalletSelector';
import { btcTransaction, satsToBtc } from '@secretkeylabs/xverse-core';
import { getTruncatedAddress } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { isScriptOutput, isSpendOutput } from '../utils';

const TransferDetailContainer = styled.div((props) => ({
  paddingBottom: props.theme.spacing(8),
}));

const SubValueText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  fontSize: 12,
  color: props.theme.colors.white_400,
}));

const YourAddressText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  fontSize: 12,
  color: props.theme.colors.white_0,
  marginRight: props.theme.spacing(2),
}));

const TxIdContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
});

type Props = {
  output: btcTransaction.EnhancedOutput;
  scriptOutputCount?: number;
};

function TransactionOutput({ output, scriptOutputCount }: Props) {
  const { btcAddress, ordinalsAddress } = useWalletSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const outputWithScript = isScriptOutput(output);

  const detailViewIcon = outputWithScript ? ScriptIcon : OutputIcon;
  const detailViewHideCopyButton = outputWithScript
    ? true
    : btcAddress === output.address || ordinalsAddress === output.address;
  const detailViewValue = outputWithScript ? (
    <SubValueText>{`${t('SCRIPT_OUTPUT')} #${scriptOutputCount}`}</SubValueText>
  ) : output.address === btcAddress || output.address === ordinalsAddress ? (
    <TxIdContainer>
      <YourAddressText>({t('YOUR_ADDRESS')})</YourAddressText>
      <SubValueText>{getTruncatedAddress(output.address)}</SubValueText>
    </TxIdContainer>
  ) : (
    <SubValueText data-testid="address-receive">{getTruncatedAddress(output.address)}</SubValueText>
  );

  return (
    <TransferDetailContainer>
      <TransferDetailView
        icon={detailViewIcon}
        hideAddress
        hideCopyButton={detailViewHideCopyButton}
        dataTestID="confirm-amount"
        amount={`${satsToBtc(
          new BigNumber(isSpendOutput(output) ? output.amount.toString() : '0'),
        ).toFixed()} BTC`}
        address={outputWithScript ? '' : output.address}
        outputScript={outputWithScript ? output.script : undefined}
        outputScriptIndex={outputWithScript ? scriptOutputCount : undefined}
      >
        {detailViewValue}
      </TransferDetailView>
    </TransferDetailContainer>
  );
}

export default TransactionOutput;
