import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { AnimatedQRScanner } from '@keystonehq/animated-qr';
import { getKeystoneAccountFromCBOR, URType, type Account } from '@secretkeylabs/xverse-core';
import { getDeviceNewAccountIndex, getNewAccountId } from '@utils/account';
import { useCallback, useState } from 'react';
import { Row } from './style';

export default function KeystoneConnect() {
  const { keystoneAccountsList, network } = useWalletSelector();
  console.warn('DEBUGPRINT[5]: index.tsx:10: keystoneAccountsList=', keystoneAccountsList);
  const { addKeystoneAccount, updateKeystoneAccounts } = useWalletReducer();
  const [importStatus, setImportStatus] = useState('scan');

  const saveAccountToWallet = useCallback(
    async (parsedCBOR: ReturnType<typeof getKeystoneAccountFromCBOR>) => {
      const accountId = getNewAccountId(keystoneAccountsList);
      const currentAccount = keystoneAccountsList.find(
        (account) => account.masterPubKey === parsedCBOR.masterFingerprint,
      );

      console.warn('DEBUGPRINT[3]: index.tsx:28: currentAccount=', currentAccount);
      if (!currentAccount) {
        const newAccount: Account = {
          id: accountId,
          stxAddress: '',
          btcAddress: parsedCBOR.nativeSegwit.address || '',
          ordinalsAddress: parsedCBOR.taproot?.address || '',
          masterPubKey: parsedCBOR.masterFingerprint || '',
          stxPublicKey: '',
          btcPublicKey: parsedCBOR.nativeSegwit.pubkey || '',
          ordinalsPublicKey: parsedCBOR.taproot.pubkey || '',
          accountType: 'keystone',
          accountName: `Keystone Account ${accountId + 1}`,
          deviceAccountIndex: getDeviceNewAccountIndex(
            keystoneAccountsList,
            network.type,
            parsedCBOR.masterFingerprint,
          ),
        };

        console.warn('DEBUGPRINT[2]: index.tsx:17: newAccountAccount=', newAccount);
        await addKeystoneAccount(newAccount);
      } else {
        const updatedAccount: Account = {
          ...currentAccount,
          btcAddress: parsedCBOR.nativeSegwit?.address || '',
          btcPublicKey: parsedCBOR.nativeSegwit?.pubkey || '',
          ordinalsAddress: parsedCBOR.taproot?.address || '',
          ordinalsPublicKey: parsedCBOR.taproot?.pubkey || '',
        };
        console.warn('DEBUGPRINT[1]: index.tsx:45: updatedAccountAccount=', updatedAccount);
        await updateKeystoneAccounts(updatedAccount);
      }
      setImportStatus('success');
    },
    [addKeystoneAccount, keystoneAccountsList, network.type, updateKeystoneAccounts],
  );

  const onSucceed = async ({ type, cbor }) => {
    try {
      const parsedCBOR = getKeystoneAccountFromCBOR(type, cbor, network.type);
      console.warn('DEBUGPRINT[1]: index.tsx:16: account=', parsedCBOR);

      saveAccountToWallet(parsedCBOR);
    } catch (e) {
      setImportStatus(`failed${e}`);
    }
  };

  const onError = (errorMessage) => {
    console.log('error: ', errorMessage);
  };

  return (
    <Row>
      <span>Scan Keystone QRCode</span>
      <AnimatedQRScanner
        handleScan={onSucceed}
        handleError={onError}
        urTypes={[URType.CryptoAccount]}
        options={{
          width: 150,
        }}
      />
      <span>status: {importStatus}</span>
    </Row>
  );
}
