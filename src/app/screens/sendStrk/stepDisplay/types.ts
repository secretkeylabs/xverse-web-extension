export type Steps =
  | {
      name: 'SelectRecipient';
    }
  | {
      name: 'AckAccountNotDeployed';
      recipientAddress: string;
    }
  | {
      name: 'SelectAmount';
      recipientAddress: string;
    }
  | {
      name: 'ReviewTransaction';
      recipientAddress: string;

      /** Amount in fri. */
      amount: bigint;
    }
  | { name: 'SendInProgress' }
  | { name: 'SendSuccess'; transactionHash: string }
  | {
      name: 'SendError';
    };
