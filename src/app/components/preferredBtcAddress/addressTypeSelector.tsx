import PreferredBtcAddressItem from '@components/preferredBtcAddressItem';
import useBtcAddressBalance from '@hooks/useBtcAddressBalance';

type Props = {
  title: string;
  address?: string;
  onClick: () => void;
  isSelected: boolean;
};

function AddressTypeSelector({ title, onClick, address, isSelected }: Props) {
  const { data } = useBtcAddressBalance(address ?? '');

  return (
    <PreferredBtcAddressItem
      title={title}
      onClick={onClick}
      address={address}
      isSelected={isSelected}
      balanceSats={data?.confirmedBalance}
    />
  );
}

export default AddressTypeSelector;
