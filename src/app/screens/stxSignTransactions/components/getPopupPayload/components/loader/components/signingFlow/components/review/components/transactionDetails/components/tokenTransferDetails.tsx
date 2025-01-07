import { cvToValue, type StacksTransaction, type TokenTransferPayload } from '@stacks/transactions';

export function TokenTransferDetails({ transaction }: { transaction: StacksTransaction }) {
  const payload = transaction.payload as TokenTransferPayload;

  return (
    <div>
      <h2>Token Transfer</h2>
      <p>Amount: {Number(payload.amount)}</p>
      <p>Recipient: {cvToValue(payload.recipient)}</p>
    </div>
  );
}
