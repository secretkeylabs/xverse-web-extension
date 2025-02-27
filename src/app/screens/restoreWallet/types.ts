export type RestoreMethod = 'seed' | 'wallet';

export type AccountDetails = {
  native: {
    address: string;
    balance: bigint;
    hasHistory: boolean;
  };
  nested: {
    address: string;
    balance: bigint;
    hasHistory: boolean;
  };
  taproot: {
    address: string;
    balance: bigint;
    hasHistory: boolean;
  };
  stx: {
    address: string;
    balance: bigint;
    hasHistory: boolean;
  };
};

export type Summary = {
  accountCount: bigint;
  nestedTotalSats: bigint;
  nativeTotalSats: bigint;
  taprootTotalSats: bigint;
  stxTotal: bigint;
  hasMoreAccounts: boolean;
  accountDetails: AccountDetails[];
};
