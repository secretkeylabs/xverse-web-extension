import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import ConfirmAddLockedBitcoinComponent from '@components/confirmAddLockedBitcoinComponent';
import InfoContainer from '@components/infoContainer';
import StakedAddressComponent from '@components/stakedAddressComponent';
import TopRow from '@components/topRow';
import TransactionDetailComponent from '@components/transactionDetailComponent';
// eslint-disable-next-line import/no-extraneous-dependencies
import useAddLockedBitcoin from '@hooks/useAddLockedBitcoin';
import useOnOriginTabClose from '@hooks/useOnTabClosed';
import useWalletSelector from '@hooks/useWalletSelector';
import type { Account } from '@secretkeylabs/xverse-core';
import { lockedBitcoins } from '@utils/locked';
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
      await lockedBitcoins.add(payload.address, payload.script, belongsToAccount.btcAddress);
      approveAddLockedBitcoinRequest();
    }
    window.close();
  };

  const handleCancelClick = () => {
    cancelAddLockedBitcoinRequest();
    window.close();
  };

  const parseCLTVScript = (cltvScript) => {
    const unlockScript = Buffer.from(cltvScript.toString('hex'), 'hex');
    // const OPS = bitcoin.script.OPS;
    const options: {
      lockTime: number;
      n?: number;
      m?: number;
      pubkeys?: string[];
      pubkey?: string;
      pubkeyhash?: string;
    } = {
      lockTime: 0,
    };

    try {
      const decompiled = bitcoin.script.decompile(unlockScript);
      if (
        decompiled &&
        decompiled.length > 4 &&
        decompiled[1] === bitcoin.script.OPS.OP_CHECKLOCKTIMEVERIFY &&
        decompiled[2] === bitcoin.script.OPS.OP_DROP
      ) {
        options.lockTime = bitcoin.script.number.decode(decompiled[0] as Buffer);
        if (
          decompiled[decompiled.length - 1] === bitcoin.script.OPS.OP_CHECKMULTISIG &&
          decompiled.length > 5
        ) {
          const n = +decompiled[decompiled.length - 6] - bitcoin.script.OPS.OP_RESERVED;
          const m = +decompiled[3] - bitcoin.script.OPS.OP_RESERVED;
          const publicKeys: any[] = decompiled.slice(4, 4 + n);
          let isValidatePublicKey = true;
          publicKeys.forEach((key: any) => {
            if (key.length !== 33) {
              isValidatePublicKey = false;
            }
          });
          if (m < n && isValidatePublicKey) {
            options.n = n;
            options.m = m;
            options.pubkeys = publicKeys;
          }
        } else if (decompiled[decompiled.length - 1] === bitcoin.script.OPS.OP_CHECKSIG) {
          if (decompiled.length === 5) {
            options.pubkey = Buffer.from(decompiled[3] as any).toString('hex');
          } else if (
            decompiled.length === 8 &&
            decompiled[3] === bitcoin.script.OPS.OP_DUP &&
            decompiled[4] === bitcoin.script.OPS.OP_HASH160 &&
            decompiled[6] === bitcoin.script.OPS.OP_EQUALVERIFY
          ) {
            options.pubkeyhash = Buffer.from(decompiled[5] as any).toString('hex');
          }
        }
      }
      return options;
    } catch (error: any) {
      throw new Error(`Check MultisigScript: ${error}`);
    }
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
      <TopRow title={t('STAKES.CONFIRM_ADD_STAKED_BITCOIN')} onClick={handleCancelClick} />

      <ConfirmAddLockedBitcoinComponent
        loading={isLoading}
        onConfirmClick={handleConfirmClick}
        onCancelClick={handleCancelClick}
      >
        <StakedAddressComponent
          address={payload.address}
          script={payload.script}
          locktime={lockTime}
          account={belongsToAccount}
          value="0"
          icon={IconBitcoin}
          currencyType="BTC"
          title={t('CONFIRM_TRANSACTION.AMOUNT')}
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
              titleText={t('STAKES.SCRIPT_MISMATCH_ALERT.TITLE')}
              bodyText={t('STAKES.SCRIPT_MISMATCH_ALERT.BODY')}
            />
          </AlertContainer>
        )}
        {!belongsToAccount && (
          <AlertContainer>
            <InfoContainer
              titleText={t('STAKES.ACCOUNT_MISMATCH_ALERT.TITLE')}
              bodyText={t('STAKES.ACCOUNT_MISMATCH_ALERT.BODY')}
            />
          </AlertContainer>
        )}
      </ConfirmAddLockedBitcoinComponent>
    </>
  );
}

export default ConfirmAddLockedBitcoin;
