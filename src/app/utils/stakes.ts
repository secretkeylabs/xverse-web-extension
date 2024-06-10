const STAKED_BITCOIN_MAP_KEY = 'core_staked_bitcoin_key';

export const stakedBitcoins = {
  get: async () => {
    const value = localStorage.getItem(STAKED_BITCOIN_MAP_KEY);
    if (value) {
      return JSON.parse(value);
    }
    return {};
  },
  add: async (address: string, script: string) => {
    const old = await stakedBitcoins.get();
    old[address] = script;
    localStorage.setItem(STAKED_BITCOIN_MAP_KEY, JSON.stringify(old));
  },
  remove: async (address: string) => {
    const old = await stakedBitcoins.get();
    if (address in old) delete old[address];
    localStorage.setItem(STAKED_BITCOIN_MAP_KEY, JSON.stringify(old));
  },
};

export const getStakedBitcoins = async () => {
  localStorage.getItem(STAKED_BITCOIN_MAP_KEY);
};
