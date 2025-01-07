import { type SmartContractPayload, type StacksTransaction } from '@stacks/transactions';

export function SmartContractDetails({ transaction }: { transaction: StacksTransaction }) {
  const payload = transaction.payload as SmartContractPayload;

  return (
    <div>
      <h2>Smart Contract</h2>
      <p>{payload.codeBody.content}</p>
    </div>
  );
}
