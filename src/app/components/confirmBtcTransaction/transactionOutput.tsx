import useWalletSelector from '@hooks/useWalletSelector';
import { btcTransaction } from '@secretkeylabs/xverse-core';

// TODO: move this to core
const isScriptOutput = (
  output: btcTransaction.EnhancedOutput,
): output is btcTransaction.TransactionScriptOutput =>
  (output as btcTransaction.TransactionScriptOutput).script !== undefined;

const isSpendOutput = (
  output: btcTransaction.EnhancedOutput,
): output is btcTransaction.TransactionOutput =>
  (output as btcTransaction.TransactionOutput).address !== undefined;

type Props = {
  output: btcTransaction.EnhancedOutput;
};

function TransactionOutput({ output }: Props) {
  const { btcAddress, ordinalsAddress } = useWalletSelector();

  if (isScriptOutput(output)) {
    return <div>Script Output: {output.script.toString()}</div>;
  }

  if (!isSpendOutput(output)) {
    return <div>Unknown output type</div>;
  }

  const isPaymentsAddress = output.address === btcAddress;
  const isOrdinalsAddress = output.address === ordinalsAddress;

  return (
    <div>
      {output.address.substring(0, 5)}
      {isPaymentsAddress && <>(to your payments address)</>}
      {isOrdinalsAddress && <>(to your ordinals address)</>}
      {!isPaymentsAddress && !isOrdinalsAddress && <>(to external address)</>}-{output.amount} sats
    </div>
  );
}

export default TransactionOutput;
