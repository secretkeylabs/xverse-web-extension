const STAKED_BITCOIN_MAP_KEY = 'CORE_STAKED_BITCOIN_MAP_KEY';

export const stakedBitcoins = {
  get: async () => {
    const value = localStorage.getItem(STAKED_BITCOIN_MAP_KEY);
    if (value) {
      return JSON.parse(value);
    }
    return {};
  },
  add: async (address: string, script: string, accountAddress: string) => {
    const old = await stakedBitcoins.get();
    if (!old[accountAddress]) {
      old[accountAddress] = {};
    }
    old[accountAddress][address] = script;
    localStorage.setItem(STAKED_BITCOIN_MAP_KEY, JSON.stringify(old));
  },
  remove: async (address: string) => {
    const old = await stakedBitcoins.get();

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const accountAddress in old) {
      const accountMap = old[accountAddress];
      if (address in accountMap) delete accountMap[address];
    }

    localStorage.setItem(STAKED_BITCOIN_MAP_KEY, JSON.stringify(old));
  },
};

export const getStakedBitcoins = async () => {
  localStorage.getItem(STAKED_BITCOIN_MAP_KEY);
};
