import useWalletSelector from '@hooks/useWalletSelector';
import * as btc from '@scure/btc-signer';
import { btcTransaction } from '@secretkeylabs/xverse-core';

type Props = {
  input: btcTransaction.EnhancedInput;
};

function TransactionInput({ input }: Props) {
  const { btcAddress, ordinalsAddress } = useWalletSelector();

  const isPaymentsAddress = input.extendedUtxo.address === btcAddress;
  const isOrdinalsAddress = input.extendedUtxo.address === ordinalsAddress;

  const insecureInput =
    input.sigHash === btc.SigHash.NONE || input.sigHash === btc.SigHash.NONE_ANYONECANPAY;

  return (
    <div>
      {input.extendedUtxo.address.substring(0, 5)}
      {isPaymentsAddress && <>(payments input)</>}
      {isOrdinalsAddress && <>(ordinals input)</>}
      {!isPaymentsAddress && !isOrdinalsAddress && <>(external input)</>}-
      {input.extendedUtxo.utxo.value} sats
      {insecureInput && <div>WARNING: Input is insecure (Sig Hash None)</div>}
    </div>
  );
}

export default TransactionInput;
