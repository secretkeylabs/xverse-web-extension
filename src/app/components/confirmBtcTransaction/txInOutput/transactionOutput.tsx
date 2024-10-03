import ScriptIcon from '@assets/img/transactions/ScriptIcon.svg';
import OutputIcon from '@assets/img/transactions/received.svg';
import TransferDetailView from '@components/transferDetailView';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { btcTransaction, satsToBtc } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { getTruncatedAddress } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const TransferDetailContainer = styled.div((props) => ({
  paddingBottom: props.theme.space.m,
}));

const SubValueText = styled(StyledP)((props) => ({
  color: props.theme.colors.white_400,
}));

const HighlightText = styled(StyledP)((props) => ({
  color: props.theme.colors.white_0,
}));

const TxIdContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: props.theme.space.xxs,
  marginTop: props.theme.space.xxxs,
}));

type Props = {
  output: btcTransaction.EnhancedOutput;
  scriptOutputCount?: number;
};

function TransactionOutput({ output, scriptOutputCount }: Props) {
  const { btcAddress, ordinalsAddress, btcPublicKey, ordinalsPublicKey } = useSelectedAccount();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const isOutputWithScript = output.type === 'script';
  const isOutputWithAddress = output.type === 'address';
  const isOutputWithPubKey = !isOutputWithScript && !isOutputWithAddress;

  const detailViewIcon = isOutputWithScript ? ScriptIcon : OutputIcon;
  const detailViewHideCopyButton =
    isOutputWithScript || isOutputWithPubKey
      ? true
      : btcAddress === output.address || ordinalsAddress === output.address;

  const detailView = () => {
    if (isOutputWithScript) {
      return (
        <SubValueText typography="body_medium_s">{`${t(
          'SCRIPT_OUTPUT',
        )} #${scriptOutputCount}`}</SubValueText>
      );
    }
    if (isOutputWithPubKey) {
      const outputType = output.type === 'pk' ? t('PUBLIC_KEY') : t('MULTISIG');
      const toOwnKey =
        output.pubKeys?.includes(btcPublicKey) || output.pubKeys?.includes(ordinalsPublicKey);
      const toOwnString = toOwnKey ? ` (${t('YOUR_PUBLIC_KEY')})` : '';
      return (
        <SubValueText typography="body_medium_s">
          {outputType}
          <HighlightText typography="body_medium_s">{toOwnString}</HighlightText>
        </SubValueText>
      );
    }

    if (output.address === btcAddress || output.address === ordinalsAddress) {
      return (
        <TxIdContainer>
          <SubValueText data-testid="address-receive" typography="body_medium_s">
            {getTruncatedAddress(output.address)}
          </SubValueText>
          <HighlightText typography="body_medium_s">({t('YOUR_ADDRESS')})</HighlightText>
        </TxIdContainer>
      );
    }

    return (
      <SubValueText data-testid="address-receive" typography="body_medium_s">
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
          new BigNumber(isOutputWithAddress ? output.amount.toString() : '0'),
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
