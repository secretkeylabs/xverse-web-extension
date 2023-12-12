import useWalletSelector from '@hooks/useWalletSelector';
import { btcTransaction } from '@secretkeylabs/xverse-core';

type Props = {
  input: btcTransaction.EnhancedInput;
};

function ExoticInputBundle({ input }: Props) {
  const { btcAddress, ordinalsAddress } = useWalletSelector();

  if (input.extendedUtxo.address !== btcAddress && input.extendedUtxo.address !== ordinalsAddress) {
    return null;
  }

  const { inscriptions, satributes } = input;

  if (inscriptions.length === 0 && satributes.length === 0) {
    return null;
  }

  return (
    <div>
      <h4>You will send</h4>
      {inscriptions.length > 0 && (
        <>
          <p>Inscriptions:</p>
          {inscriptions.map((inscription) => (
            <div>{inscription.id}</div>
          ))}
        </>
      )}
      {satributes.length > 0 && (
        <>
          <p>Satributes:</p>
          {satributes.map((satribute) => (
            <div>{satribute.types.join(' ')}</div>
          ))}
        </>
      )}
    </div>
  );
}

export default ExoticInputBundle;
