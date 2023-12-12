import { btcTransaction } from '@secretkeylabs/xverse-core';

type Props = {
  feeOutput: btcTransaction.TransactionFeeOutput;
};

function TransactionOutput({ feeOutput }: Props) {
  return (
    <div>
      Fees: {feeOutput.amount} sats
      {feeOutput.inscriptions.length > 0 && (
        <div>
          Inscriptions spent as fees:
          {feeOutput.inscriptions.map((i) => (
            <div>{i.id}</div>
          ))}
        </div>
      )}
      {feeOutput.satributes.length > 0 && (
        <div>
          Satributes spent as fees:
          {feeOutput.satributes.map((s) => (
            <div key={s.offset}>
              {s.types.join(' ')} - {s.amount}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionOutput;
