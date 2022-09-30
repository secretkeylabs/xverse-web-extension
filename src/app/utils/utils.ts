export interface FungibleToken {
    name: string;
    balance: string;
    total_sent: string;
    total_received: string;
    principal: string;
    assetName: string;
    ticker?: string;
    decimals?: number;
    image?: string;
    visible?: boolean;
    supported?: boolean;
    tokenFiatRate?: number | null;
  }

  export interface Coin {
    id?: number;
    name: string;
    ticker: string;
    contract: string;
    description?: string;
    image?: string;
    decimals?: number;
    supported?: boolean;
    tokenFiatRate?: number | null;
    visible?: boolean;
  }

  export interface Account {
    id: number;
    stxAddress: string;
    btcAddress: string;
    masterPubKey: string;
    stxPublicKey: string;
    btcPublicKey: string;
    bnsName?: string;
  }

  export interface FungibleToken {
    name: string;
    balance: string;
    total_sent: string;
    total_received: string;
    principal: string;
    assetName: string;
    ticker?: string;
    decimals?: number;
    image?: string;
    visible?: boolean;
    supported?: boolean;
    tokenFiatRate?: number | null;
  }
  

  /**
 * get ticker from name
 */
export function getTicker(name: string) {
    if (name.includes('-')) {
      const parts = name.split('-');
      if (parts.length >= 3) {
        return `${parts[0][0]}${parts[1][0]}${parts[2][0]}`;
      } else {
        return `${parts[0][0]}${parts[1][0]}${parts[1][1]}`;
      }
    } else {
      if (name.length >= 3) {
        return `${name[0]}${name[1]}${name[2]}`;
      }
      return name;
    }
  }