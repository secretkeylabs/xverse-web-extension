import { type SmartContractPayloadWire, type StacksTransactionWire } from '@stacks/transactions';

export function SmartContractDetails({ transaction }: { transaction: StacksTransactionWire }) {
  const payload = transaction.payload as SmartContractPayloadWire;

  return (
    <div>
      <h2>Smart Contract</h2>
      <p>{payload.codeBody.content}</p>
    </div>
  );
}
