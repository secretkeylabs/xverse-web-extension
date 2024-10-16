import PreferredBtcAddressItem from '@components/preferredBtcAddressItem';
import useBtcAddressBalance from '@hooks/useBtcAddressBalance';
import { satsToBtc } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';

type Props = {
  title: string;
  address?: string;
  onClick: () => void;
  isSelected: boolean;
};

function AddressTypeSelector({ title, onClick, address, isSelected }: Props) {
  const { data } = useBtcAddressBalance(address ?? '');

  const balance =
    data?.confirmedBalance !== undefined
      ? `${satsToBtc(BigNumber(data.confirmedBalance))} BTC`
      : '';

  return (
    <PreferredBtcAddressItem
      title={title}
      onClick={onClick}
      address={address}
      isSelected={isSelected}
      balance={balance}
    />
  );
}

export default AddressTypeSelector;
