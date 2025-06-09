import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AckAccountNotDeployed } from '../components/ackAccountNotDeployed';
import { ReviewTransaction } from '../components/reviewTransaction';
import { SelectAmount } from '../components/selectAmount';
import { SelectRecipient } from '../components/selectRecipient';
import { SendError } from '../components/sendError';
import { SendSuccess } from '../components/sendSuccess';
import { useSendTransaction } from '../onConfirm';
import { useCheckRecipientAccountDeployed } from '../onSelectAddress';
import type { Steps } from './types';

function StepDisplay() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Steps>({
    name: 'SelectRecipient',
  });

  const sendTransaction = useSendTransaction({
    onIsLoading: () => {
      setStep({ name: 'SendInProgress' });
    },
    onSuccess: (transactionHash) => {
      setStep({ name: 'SendSuccess', transactionHash });
    },
    onError: () => {
      setStep({ name: 'SendError' });
    },
  });

  const checkRecipientAccountDeployed = useCheckRecipientAccountDeployed({
    onLoad: () => {
      /* TODO: show loading state */
    },
    onIsDeployed: (address) => {
      setStep({
        name: 'SelectAmount',
        recipientAddress: address,
      });
    },
    onIsNotDeployed: (address: string) => {
      setStep({ name: 'AckAccountNotDeployed', recipientAddress: address });
    },
    onError: () => {
      setStep({ name: 'SendError' });
    },
  });

  switch (step.name) {
    case 'SelectRecipient':
      return (
        <SelectRecipient
          onSelect={(recipientAddress) => checkRecipientAccountDeployed(recipientAddress)}
          onBack={() => navigate(-1)}
        />
      );
    case 'AckAccountNotDeployed':
      return (
        <AckAccountNotDeployed
          recipientAddress={step.recipientAddress}
          onConfirm={() =>
            setStep({
              name: 'SelectAmount',
              recipientAddress: step.recipientAddress,
            })
          }
          onCancel={() => setStep({ name: 'SelectRecipient' })}
          onBack={() => setStep({ name: 'SelectRecipient' })}
        />
      );
    case 'SelectAmount':
      return (
        <SelectAmount
          onSelect={(amount) =>
            setStep({
              name: 'ReviewTransaction',
              recipientAddress: step.recipientAddress,
              amount,
            })
          }
          onBack={() => setStep({ name: 'SelectRecipient' })}
          onError={() => setStep({ name: 'SendError' })}
        />
      );
    case 'ReviewTransaction':
      return (
        <ReviewTransaction
          recipientAddress={step.recipientAddress}
          amount={step.amount}
          onConfirm={sendTransaction}
          onBack={() => setStep({ name: 'SelectAmount', recipientAddress: step.recipientAddress })}
          onCancel={() => setStep({ name: 'SelectRecipient' })}
        />
      );
    case 'SendInProgress':
      return null;
    case 'SendSuccess':
      return <SendSuccess transactionHash={step.transactionHash} onDone={() => navigate('/')} />;
    case 'SendError':
      return (
        <SendError
          onBack={() => navigate(-1)}
          onRetry={() =>
            setStep({
              name: 'SelectRecipient',
            })
          }
        />
      );
    default:
      throw new Error(`Unknown step`, { cause: step satisfies never });
  }
}

export default StepDisplay;
