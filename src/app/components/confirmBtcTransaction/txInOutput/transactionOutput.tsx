import ScriptIcon from '@assets/img/transactions/ScriptIcon.svg';
import OutputIcon from '@assets/img/transactions/output.svg';
import TransferDetailView from '@components/transferDetailView';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { btcTransaction, satsToBtc } from '@secretkeylabs/xverse-core';
import { getTruncatedAddress } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { isAddressOutput, isPubKeyOutput, isScriptOutput } from '../utils';

const TransferDetailContainer = styled.div((props) => ({
  paddingBottom: props.theme.spacing(8),
}));

const SubValueText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  fontSize: 12,
  color: props.theme.colors.white_400,
}));

const HighlightText = styled.h1((props) => ({
  color: props.theme.colors.white_0,
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
  const { btcAddress, ordinalsAddress, btcPublicKey, ordinalsPublicKey } = useSelectedAccount();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const isOutputWithScript = isScriptOutput(output);
  const isOutputWithPubKey = isPubKeyOutput(output);

  const detailViewIcon = isOutputWithScript ? ScriptIcon : OutputIcon;
  const detailViewHideCopyButton =
    isOutputWithScript || isOutputWithPubKey
      ? true
      : btcAddress === output.address || ordinalsAddress === output.address;

  const detailView = () => {
    if (isOutputWithScript) {
      return <SubValueText>{`${t('SCRIPT_OUTPUT')} #${scriptOutputCount}`}</SubValueText>;
    }
    if (isOutputWithPubKey) {
      const outputType = output.type === 'pk' ? t('PUBLIC_KEY') : t('MULTISIG');
      const toOwnKey =
        output.pubKeys?.includes(btcPublicKey) || output.pubKeys?.includes(ordinalsPublicKey);
      const toOwnString = toOwnKey ? ` (${t('YOUR_PUBLIC_KEY')})` : '';
      return (
        <SubValueText>
          {outputType}
          <HighlightText>{toOwnString}</HighlightText>
        </SubValueText>
      );
    }

    if (output.address === btcAddress || output.address === ordinalsAddress) {
      return (
        <TxIdContainer>
          <YourAddressText>({t('YOUR_ADDRESS')})</YourAddressText>
          <SubValueText data-testid="address-receive">
            {getTruncatedAddress(output.address)}
          </SubValueText>
        </TxIdContainer>
      );
    }

    return (
      <SubValueText data-testid="address-receive">
        {getTruncatedAddress(output.address)}
      </SubValueText>
    );
  };

  return (
    <TransferDetailContainer>
      <TransferDetailView
        icon={detailViewIcon}
        hideAddress
        hideCopyButton={detailViewHideCopyButton}
        dataTestID="confirm-amount"
        amount={`${satsToBtc(
          new BigNumber(isAddressOutput(output) ? output.amount.toString() : '0'),
        ).toFixed()} BTC`}
        address={isOutputWithScript || isOutputWithPubKey ? '' : output.address}
        outputScript={isOutputWithScript ? output.script : undefined}
        outputScriptIndex={isOutputWithScript ? scriptOutputCount : undefined}
      >
        {detailView()}
      </TransferDetailView>
    </TransferDetailContainer>
  );
}

export default TransactionOutput;
