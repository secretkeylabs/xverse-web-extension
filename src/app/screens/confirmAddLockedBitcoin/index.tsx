import ConfirmAddLockedBitcoinComponent from '@components/confirmAddLockedBitcoinComponent';
import InfoContainer from '@components/infoContainer';
import LockedAddressComponent from '@components/lockedAddressComponent';
import TopRow from '@components/topRow';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useAddLockedBitcoin from '@hooks/useAddLockedBitcoin';
import useOnOriginTabClose from '@hooks/useOnTabClosed';
import useWalletSelector from '@hooks/useWalletSelector';
import type { Account } from '@secretkeylabs/xverse-core';
import { lockedBitcoins, parseCLTVScript } from '@utils/locked';
import * as bitcoin from 'bitcoinjs-lib';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const AlertContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(12),
}));

function ConfirmAddLockedBitcoin() {
  const { t } = useTranslation('translation');
  const [hasTabClosed, setHasTabClosed] = useState(false);
  const [isScriptMatched, setIsScriptMatched] = useState(false);
  const { accountsList } = useWalletSelector();
  const { approveAddLockedBitcoinRequest, cancelAddLockedBitcoinRequest, tabId, network, payload } =
    useAddLockedBitcoin();

  const bitcoinNetwork = useMemo(
    () => (network.type === 'Mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet),
    [network],
  );

  useOnOriginTabClose(Number(tabId), () => {
    setHasTabClosed(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const [belongsToAccount, setBelongsToAccount] = useState<Account>();

  const handleConfirmClick = async () => {
    setIsLoading(true);
    if (belongsToAccount && payload.address && payload.script) {
      await lockedBitcoins.add(
        payload.address,
        payload.script,
        belongsToAccount.btcAddress,
        lockTime,
      );
      approveAddLockedBitcoinRequest();
    }
    window.close();
  };

  const handleCancelClick = () => {
    cancelAddLockedBitcoinRequest();
    window.close();
  };

  const checkScriptAddress = useCallback(() => {
    let witness = false;
    if (!(payload.address.length === 34 || payload.address.length === 35)) {
      witness = true;
    }
    const redeemScriptBuf = Buffer.from(payload.script.toString('hex'), 'hex');
    const script = (witness ? bitcoin.payments.p2wsh : bitcoin.payments.p2sh)({
      redeem: {
        output: redeemScriptBuf,
        network: bitcoinNetwork,
      },
      network: bitcoinNetwork,
    }).output;
    if (!script) {
      return false;
    }
    const scriptAddress: string = bitcoin.address.fromOutputScript(script, bitcoinNetwork);
    if (scriptAddress === payload.address) {
      return true;
    }
    return false;
  }, [bitcoinNetwork, payload]);

  useEffect(() => {
    if (checkScriptAddress()) {
      setIsScriptMatched(true);
      const lockOptions = parseCLTVScript(payload.script);
      setLockTime(lockOptions.lockTime);

      if (lockOptions.pubkey || lockOptions.pubkeyhash) {
        const account = accountsList.find(
          (acc) =>
            lockOptions.pubkey === acc.btcPublicKey ||
            lockOptions.pubkeyhash ===
              bitcoin.crypto.hash160(Buffer.from(acc.btcPublicKey, 'hex')).toString('hex'),
        );

        setBelongsToAccount(account);
      }
    } else {
      setIsScriptMatched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, bitcoinNetwork, accountsList]);
  return (
    <>
      <TopRow title={t('LOCKED.CONFIRM_ADD_LOCKED_BITCOIN')} onClick={handleCancelClick} />

      <ConfirmAddLockedBitcoinComponent
        loading={isLoading}
        onConfirmClick={handleConfirmClick}
        onCancelClick={handleCancelClick}
      >
        <LockedAddressComponent
          address={payload.address}
          script={payload.script}
          locktime={lockTime}
          account={belongsToAccount}
        />

        <TransactionDetailComponent title={t('CONFIRM_TRANSACTION.NETWORK')} value={network.type} />
        {hasTabClosed && (
          <AlertContainer>
            <InfoContainer
              titleText={t('WINDOW_CLOSED_ALERT.TITLE')}
              bodyText={t('WINDOW_CLOSED_ALERT.BODY')}
            />
          </AlertContainer>
        )}
        {!isScriptMatched && (
          <AlertContainer>
            <InfoContainer
              titleText={t('LOCKED.SCRIPT_MISMATCH_ALERT.TITLE')}
              bodyText={t('LOCKED.SCRIPT_MISMATCH_ALERT.BODY')}
            />
          </AlertContainer>
        )}
        {!belongsToAccount && (
          <AlertContainer>
            <InfoContainer
              titleText={t('LOCKED.ACCOUNT_MISMATCH_ALERT.TITLE')}
              bodyText={t('LOCKED.ACCOUNT_MISMATCH_ALERT.BODY')}
            />
          </AlertContainer>
        )}
      </ConfirmAddLockedBitcoinComponent>
    </>
  );
}

export default ConfirmAddLockedBitcoin;
