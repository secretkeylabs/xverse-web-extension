import useSelectedAccount from '@hooks/useSelectedAccount';
import { AnimatedQRScanner } from '@keystonehq/animated-qr';
import { btcTransaction, getTxPsbtFromCBOR, URType } from '@secretkeylabs/xverse-core';
import styled from 'styled-components';

export const ViewTxContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
`;

interface KeystoneScanSignatureProps {
  transaction?: btcTransaction.EnhancedTransaction;
}

function KeystoneScanSignature({ transaction }: KeystoneScanSignatureProps) {
  const onSucceed = async ({ type, cbor }) => {
    const { tx, psbtHex } = getTxPsbtFromCBOR(type, cbor);
    console.warn('DEBUGPRINT[6]: index.tsx:34: tx, psbtHex=', psbtHex);

    if (!transaction) return;

    try {
      const id = await transaction.broadcastTx(tx);
      console.warn('DEBUGPRINT[1]: index.tsx:25: id=', id);
    } catch (e) {
      console.error('error', e);
    }
  };

  const onError = (errorMessage) => {
    console.log('error: ', errorMessage);
  };
  return (
    <ViewTxContainer>
      <div>
        <span>Scan Keystone QRCode</span>
        <AnimatedQRScanner
          handleScan={onSucceed}
          handleError={onError}
          urTypes={[URType.CryptoPSBT]}
          options={{
            width: 150,
          }}
        />
      </div>
      <div>Scan Psbt Signature QRCode</div>
    </ViewTxContainer>
  );
}

export default KeystoneScanSignature;
