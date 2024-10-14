import { useTxSummaryContext } from '@components/confirmBtcTransaction/hooks/useTxSummaryContext';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import { AnimatedQRCode } from '@keystonehq/animated-qr';
import {
  btcTransaction,
  generatePsbtToUR,
  getPsbtFromSummary,
  networks,
  UR,
  type AggregatedSummary,
  type UserTransactionSummary,
} from '@secretkeylabs/xverse-core';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

export const ViewTxContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
`;

interface KeystoneViewTxQRCodeProps {
  transaction?: btcTransaction.EnhancedTransaction;
}

function KeystoneViewTxQRCode({ transaction }: KeystoneViewTxQRCodeProps) {
  const [ur, setUR] = useState<UR>();
  const selectedAccount = useSelectedAccount();

  useEffect(() => {
    if (!selectedAccount || !transaction) return;
    async function load() {
      const tx = transaction!;
      console.warn('DEBUGPRINT[2]: index.tsx:43: tx=', tx);
      const psbtHex = await tx.getTxPsbt({ account: selectedAccount });
      console.warn('DEBUGPRINT[6]: index.tsx:38: psbtHex=', psbtHex);
      const genUR = generatePsbtToUR(psbtHex);
      console.warn('DEBUGPRINT[5]: index.tsx:52: genUR2=', genUR);
      setUR(genUR);
    }
    load();
  }, [transaction, selectedAccount]);

  console.warn(
    "DEBUGPRINT[5]: index.tsx:46: ur.cbor.toString('hex')=",
    ur && ur.cbor.toString('hex'),
  );

  return (
    <ViewTxContainer>
      <div>
        {ur && (
          <AnimatedQRCode
            type={ur.type}
            cbor={ur.cbor.toString('hex')}
            options={{ capacity: 200, interval: 500 }}
          />
        )}
      </div>
      <div>View Tx QRCode</div>
    </ViewTxContainer>
  );
}

export default KeystoneViewTxQRCode;
