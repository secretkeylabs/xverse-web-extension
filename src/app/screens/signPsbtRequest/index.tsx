// import ConfirmBtcTransactionComponent from '@components/confirmBtcTransactionComponent';
import ActionButton from '@components/button';
import useSignPsbtTx from '@hooks/useSignPsbtTx';
import useWalletSelector from '@hooks/useWalletSelector';
import { parsePsbt } from '@secretkeylabs/xverse-core/transactions/psbt';
// import styled from 'styled-components';

function SignPsbtRequest() {
  const { selectedAccount } = useWalletSelector();
  const { payload, confirmSignPsbt } = useSignPsbtTx();
  const parsedPsbt = parsePsbt(
    selectedAccount!,
    payload.inputsToSign,
    payload.psbtBase64,
  );

  const onSignPsbtConfirmed = async () => {
    await confirmSignPsbt();
    window.close();
  };
  return (
    <>
      <h3>
        Fees:
        {' '}
        {parsedPsbt.fees.toString()}
      </h3>
      <h3>
        Net Value
        {' '}
        {parsedPsbt.netAmount.toString()}
      </h3>
      <div>
        <h3>Inputs</h3>
        {parsedPsbt.inputs.map((input) => (
          <div>
            Input:
            {' '}
            {input.index}
            <p>
              txId:
              {' '}
              {input.txid}
            </p>
            <p>{input.value.toString()}</p>
          </div>
        ))}
      </div>
      <div>
        <h3>Outputs</h3>
        {parsedPsbt.outputs.map((output) => (
          <div>
            Output Address:
            {' '}
            {output.address}
            <p>{output.amount.toString()}</p>
          </div>
        ))}
      </div>
      <ActionButton text="Confirm" onPress={onSignPsbtConfirmed} />
    </>
  );
}

export default SignPsbtRequest;
