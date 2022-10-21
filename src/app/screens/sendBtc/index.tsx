import SendForm from '@components/sendForm';
import TopRow from '@components/topRow';
import { StoreState } from '@stores/index';
import { BITCOIN_DUST_AMOUNT_SATS } from '@utils/constants';
import { btcToSats, satsToBtc, validateBtcAddress } from '@utils/walletUtils';
import { signBtcTransaction } from '@secretkeylabs/xverse-core/transactions';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function SendBtcScreen() {
  const [error, setError] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const {
    btcAddress,
    network,
    btcBalance,
    selectedAccount,
    seedPhrase,
  } = useSelector((state: StoreState) => state.walletState);
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });

  const navigate = useNavigate();

  const {
    isLoading,
    data,
    error: txError,
    refetch
  } = useQuery(
    [
      'btc-signed-transaction',
      {
        recipientAddress,
        btcAddress,
        amount,
        accountId: selectedAccount?.id,
        seedPhrase,
        network,
      },
    ],
    async () => signBtcTransaction({
      recipientAddress,
      btcAddress,
      amount,
      index: selectedAccount?.id ?? 0,
      fee: new BigNumber(0),
      seedPhrase,
      network,
    }),
    {
      enabled: false,
    },
  );
  const handleBackButtonClick = () => {
    navigate('/');
  };

  useEffect(() => {
    if (data) {
      console.log("data");
      console.log(data);
      navigate('/confirm-btc-tx');
    }
  }, [data]);

  useEffect(() => {
      if (txError) {
        setError(txError.toString());
      }
  }, [txError]);

  function validateFields(address: string, amountToSend: string): boolean {
    if (!address) {
      setError(t('ERRORS.ADDRESS_REQUIRED'));
      return false;
    }

    if (!amountToSend) {
      setError(t('ERRORS.AMOUNT_REQUIRED'));
      return false;
    }

    if (!validateBtcAddress(address, network)) {
      setError(t('ERRORS.ADDRESS_INVALID'));
      return false;
    }

    if (address === btcAddress) {
      setError(t('ERRORS.SEND_TO_SELF'));
      return false;
    }

    let parsedAmount = new BigNumber(0);

    try {
      if (!Number.isNaN(Number(amountToSend))) {
        parsedAmount = new BigNumber(amountToSend);
      } else {
        setError(t('ERRORS.INVALID_AMOUNT'));
        return false;
      }
    } catch (e) {
      setError(t('ERRORS.INVALID_AMOUNT'));
      return false;
    }

    if (parsedAmount.isZero()) {
      setError(t('ERRORS.INVALID_AMOUNT'));
      return false;
    }

    if (btcToSats(parsedAmount).lt(BITCOIN_DUST_AMOUNT_SATS)) {
      setError(t('ERRORS.MINIMUM_AMOUNT'));
      return false;
    }

    if (btcToSats(parsedAmount).gt(btcBalance)) {
      setError(t('ERRORS.INSUFFICIENT_BALANCE'));
      return false;
    }
    return true;
  }

  const handleNextClick = (address: string, amountToSend: string) => {
    setRecipientAddress(address);
    setAmount(amountToSend);
    if (validateFields(address, amountToSend)) { refetch(); }
  };

  function getBalance() {
    return satsToBtc(new BigNumber(btcBalance)).toNumber();
  }

  return (
    <>
      <TopRow title={t('SEND')} onClick={handleBackButtonClick} />
      <SendForm
        currencyType="BTC"
        error={error}
        balance={getBalance()}
        onPressSend={handleNextClick}
        processing={isLoading}
      />
    </>
  );
}

export default SendBtcScreen;
