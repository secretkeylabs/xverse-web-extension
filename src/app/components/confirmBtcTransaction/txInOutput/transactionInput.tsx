import InputIcon from '@assets/img/transactions/arrowUpRed.svg';
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

const TxIdText = styled(StyledP)((props) => ({
  marginLeft: props.theme.space.xxs,
}));

const YourAddressText = styled(StyledP)((props) => ({
  marginRight: props.theme.space.xxs,
}));

const TxIdContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: props.theme.space.xxs,
}));

type Props = {
  input: btcTransaction.EnhancedInput;
};

function TransactionInput({ input }: Props) {
  const { btcAddress, ordinalsAddress } = useSelectedAccount();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  const isPaymentsAddress = input.extendedUtxo.address === btcAddress;
  const isOrdinalsAddress = input.extendedUtxo.address === ordinalsAddress;
  const isExternalInput = !isPaymentsAddress && !isOrdinalsAddress;

  // TODO: show this in the UI?
  // const insecureInput =
  //   input.sigHash === btc.SigHash.NONE || input.sigHash === btc.SigHash.NONE_ANYONECANPAY;

  const renderAddress = (addressToBeDisplayed: string) =>
    addressToBeDisplayed === btcAddress || addressToBeDisplayed === ordinalsAddress ? (
      <TxIdContainer>
        <SubValueText data-testid="address-send" typography="body_s">
          {getTruncatedAddress(addressToBeDisplayed)}
        </SubValueText>
        <YourAddressText typography="body_s">({t('YOUR_ADDRESS')})</YourAddressText>
      </TxIdContainer>
    ) : (
      <SubValueText typography="body_s">{getTruncatedAddress(addressToBeDisplayed)}</SubValueText>
    );

  return (
    <TransferDetailContainer>
      <TransferDetailView
        icon={InputIcon}
        hideAddress
        dataTestID="confirm-balance"
        hideCopyButton={isPaymentsAddress || isOrdinalsAddress}
        amount={`${satsToBtc(
          new BigNumber(input.extendedUtxo.utxo.value.toString()),
        ).toFixed()} BTC`}
        address={isExternalInput ? input.extendedUtxo.utxo.txid : input.extendedUtxo.address}
      >
        {isExternalInput ? (
          <TxIdContainer>
            <SubValueText typography="body_s">
              {getTruncatedAddress(input.extendedUtxo.utxo.txid)}
            </SubValueText>
            <TxIdText typography="body_s">(txid)</TxIdText>
          </TxIdContainer>
        ) : (
          renderAddress(input.extendedUtxo.address)
        )}
      </TransferDetailView>
    </TransferDetailContainer>
  );
}

export default TransactionInput;
