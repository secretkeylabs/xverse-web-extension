const STAKED_BITCOIN_MAP_KEY = 'CORE_STAKED_BITCOIN_MAP_KEY';

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
    const value = localStorage.getItem(STAKED_BITCOIN_MAP_KEY);
    if (value) {
      return JSON.parse(value);
    }
    return {};
  },
  add: async (address: string, script: string, accountAddress: string) => {
    const old = await lockedBitcoins.getAll();
    if (!old[accountAddress]) {
      old[accountAddress] = {};
    }
    old[accountAddress][address] = script;
    localStorage.setItem(STAKED_BITCOIN_MAP_KEY, JSON.stringify(old));
  },
  remove: async (address: string) => {
    const old = await lockedBitcoins.getAll();

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const accountAddress in old) {
      const accountMap = old[accountAddress];
      if (address in accountMap) delete accountMap[address];
    }

    localStorage.setItem(STAKED_BITCOIN_MAP_KEY, JSON.stringify(old));
  },
};

export const getlockedBitcoins = async () => {
  localStorage.getItem(STAKED_BITCOIN_MAP_KEY);
};
