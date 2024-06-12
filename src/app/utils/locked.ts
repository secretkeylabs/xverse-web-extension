import * as bitcoin from 'bitcoinjs-lib';

const LOCKED_BITCOIN_MAP_KEY = 'CORE_LOCKED_BITCOIN_MAP_KEY';

export const lockedBitcoins = {
  get: async (accountAddress: string) => {
    const old = await lockedBitcoins.getAll();
    return old[accountAddress];
  },
  exist: async (accountAddress?: string) => {
    if (!accountAddress) return false;
    const old = await lockedBitcoins.getAll();
    if (!old[accountAddress]) return false;
    if (Object.keys(old[accountAddress]).length === 0) return false;
    return true;
  },
  getAll: async () => {
    const value = localStorage.getItem(LOCKED_BITCOIN_MAP_KEY);
    if (value) {
      return JSON.parse(value);
    }
    return {};
  },
  add: async (address: string, script: string, accountAddress: string, lockTime: number) => {
    const old = await lockedBitcoins.getAll();
    if (!old[accountAddress]) {
      old[accountAddress] = {};
    }
    old[accountAddress][address] = { script, lockTime };
    localStorage.setItem(LOCKED_BITCOIN_MAP_KEY, JSON.stringify(old));
  },
  remove: async (address: string) => {
    const old = await lockedBitcoins.getAll();

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const accountAddress in old) {
      const accountMap = old[accountAddress];
      if (address in accountMap) delete accountMap[address];
    }

    localStorage.setItem(LOCKED_BITCOIN_MAP_KEY, JSON.stringify(old));
  },
};

export const parseCLTVScript = (cltvScript) => {
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

export default lockedBitcoins;
