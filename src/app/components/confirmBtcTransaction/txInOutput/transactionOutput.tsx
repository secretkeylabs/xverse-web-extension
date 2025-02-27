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
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  const { btcAddresses, btcPublicKey, ordinalsPublicKey } = useSelectedAccount();

  const userAddresses = Object.values(btcAddresses).map((address) => address.address);

  const isOutputWithScript = output.type === 'script';
  const isOutputWithAddress = output.type === 'address';
  const isOutputWithPubKey = !isOutputWithScript && !isOutputWithAddress;

  const isOutputToOwnAddress =
    isOutputWithScript || isOutputWithPubKey
      ? false
      : userAddresses.some((address) => address === output.address);

  const detailViewIcon = isOutputWithScript ? ScriptIcon : OutputIcon;
  const detailViewHideCopyButton =
    isOutputWithScript || isOutputWithPubKey ? true : isOutputToOwnAddress;

  const detailView = () => {
    if (isOutputWithScript) {
      return (
        <SubValueText typography="body_medium_s">{`${t(
          'SCRIPT_OUTPUT',
        )} #${scriptOutputCount}`}</SubValueText>
      );
    }
    if (isOutputWithPubKey) {
      const outputType =
        output.type === 'pk'
          ? t('PUBLIC_KEY')
          : output.type === 'p2a'
          ? t('PAY_TO_ANCHOR')
          : t('MULTISIG');
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

    if (isOutputToOwnAddress) {
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
        amount={`${satsToBtc(new BigNumber(output.amount.toString())).toFixed()} BTC`}
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
