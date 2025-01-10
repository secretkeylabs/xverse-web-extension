import {
  cvToValue,
  type StacksTransactionWire,
  type TokenTransferPayloadWire,
} from '@stacks/transactions';

export function TokenTransferDetails({ transaction }: { transaction: StacksTransactionWire }) {
  const payload = transaction.payload as TokenTransferPayloadWire;

  return (
    <div>
      <h2>Token Transfer</h2>
      <p>Amount: {Number(payload.amount)}</p>
      <p>Recipient: {cvToValue(payload.recipient)}</p>
    </div>
  );
}
