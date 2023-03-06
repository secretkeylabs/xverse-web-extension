import { GetAddressOptions, openRequestAddressPopup } from 'sats-connect';

const useBtcMethods = async () => {
  const getAddressOptions: GetAddressOptions = {
    payload: {
      purpose: {
        purpose: 'ordinals',
      },
      message: 'Address for receiving Ordinals',
      network: {
        type: 'Mainnet',
        address: '',
      },
    },
    onFinish: (response) => alert(response),
    onCancel: () => alert('Canceled'),
  };
  await openRequestAddressPopup(getAddressOptions);
};

export default useBtcMethods;
