export type Props = {
  onSelect: (amount: bigint) => void;
  onBack: () => void;
  onError: (error: unknown) => void;
};

export type LayoutProps = Omit<Props, 'onError'> & {
  /** Amount in fri. */
  balance: string | number | bigint;
};

export type BalanceLoaderProps = Props & {
  address: string;
};
