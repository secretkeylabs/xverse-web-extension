import { btcTransaction } from '@secretkeylabs/xverse-core';
import ExoticBundle from './exoticBundle';
import ExoticInputBundle from './exoticInputBundle';
import FeeOutput from './feeOutput';
import TransactionInput from './transactionInput';
import TransactionOutput from './transactionOutput';

type Props = {
  isPartialTransaction: boolean;

  inputs: btcTransaction.EnhancedInput[];
  outputs: btcTransaction.EnhancedOutput[];
  feeOutput?: btcTransaction.TransactionFeeOutput;

  // TODO: these are for txn screens which we will tackle next
  // TODO: By having these as generic props here, we can use the generic set fee rate component for all use cases
  getFeeForFeeRate?: (feeRate: number, useEffectiveFeeRate?: boolean) => Promise<number>;
  onFeeRateSet?: (feeRate: number) => void;
  // TODO: use this to disable the edit fee component when it is created
  isSubmitting: boolean;
};

function TransactionSummary({
  inputs,
  outputs,
  feeOutput,
  isPartialTransaction,
  isSubmitting,
  getFeeForFeeRate,
  onFeeRateSet,
}: Props) {
  return (
    <div>
      <h2>Transaction Summary</h2>
      <h3>Exotic Bundles:</h3>
      {!isPartialTransaction &&
        outputs.map((output, index) => (
          // TODO: Don't use index as key
          // eslint-disable-next-line react/no-array-index-key
          <ExoticBundle output={output} key={index} />
        ))}
      {isPartialTransaction &&
        inputs.map((input) => (
          // TODO: Don't use index as key
          // eslint-disable-next-line react/no-array-index-key
          <ExoticInputBundle input={input} key={input.extendedUtxo.outpoint} />
        ))}
      <br />
      <br />
      <h3>Inputs:</h3>
      {inputs.map((input) => (
        <TransactionInput input={input} key={input.extendedUtxo.outpoint} />
      ))}
      <h3>Outputs:</h3>
      {outputs.map((output, index) => (
        // TODO: Don't use index as key
        // eslint-disable-next-line react/no-array-index-key
        <TransactionOutput output={output} key={index} />
      ))}

      {feeOutput && (
        <>
          <p>Fee:</p>
          <FeeOutput feeOutput={feeOutput} />
        </>
      )}
    </div>
  );
}

export default TransactionSummary;
