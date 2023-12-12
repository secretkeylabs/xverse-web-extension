import useWalletSelector from '@hooks/useWalletSelector';
import { btcTransaction } from '@secretkeylabs/xverse-core';

// TODO: move this to core
const isSpendOutput = (
  output: btcTransaction.EnhancedOutput,
): output is btcTransaction.TransactionOutput =>
  (output as btcTransaction.TransactionOutput).address !== undefined;

type Props = {
  output: btcTransaction.EnhancedOutput;
};

function ExoticBundle({ output }: Props) {
  const { btcAddress, ordinalsAddress } = useWalletSelector();

  if (!isSpendOutput(output)) {
    return null;
  }

  const toPaymentsAddress = output.address === btcAddress;
  const toOrdinalsAddress = output.address === ordinalsAddress;

  // Incoming payments
  if (toPaymentsAddress || toOrdinalsAddress) {
    const inscriptions = output.inscriptions.map((inscription) => (
      <div key={inscription.id}>{inscription.id}</div>
    ));
    const satributes = output.satributes.map((satribute) => (
      <div key={satribute.offset}>
        {satribute.types.join(' ')} - {satribute.amount}
      </div>
    ));

    if (inscriptions.length === 0 && satributes.length === 0) {
      return null;
    }
    return (
      <div>
        <h3>
          You will receive
          {toPaymentsAddress && <>(to your payments address)</>}
          {toOrdinalsAddress && <>(to your ordinals address)</>}
        </h3>
        {inscriptions.length > 0 && (
          <>
            <p>Inscriptions:</p>
            {inscriptions}
          </>
        )}
        {satributes.length > 0 && (
          <>
            <p>Satributes:</p>
            {satributes}
          </>
        )}
      </div>
    );
  }

  // Potential outgoing payments
  const inscriptions = output.inscriptions
    .filter((i) => i.fromAddress in [btcAddress, ordinalsAddress])
    .map((inscription) => <div key={inscription.offset}>{inscription.id}</div>);
  const satributes = output.satributes
    .filter((s) => s.fromAddress in [btcAddress, ordinalsAddress])
    .map((satribute) => (
      <div key={satribute.offset}>
        {satribute.types.join(' ')} - {satribute.amount}
      </div>
    ));

  if (inscriptions.length === 0 && satributes.length === 0) {
    return null;
  }

  return (
    <div>
      <h3>You will send to {output.address.substring(0, 6)}...</h3>
      {inscriptions.length > 0 && (
        <>
          <p>Inscriptions:</p>
          {inscriptions}
        </>
      )}
      {satributes.length > 0 && (
        <>
          <p>Satributes:</p>
          {satributes}
        </>
      )}
    </div>
  );
}

export default ExoticBundle;
