import SendForm from '@components/sendForm';
import TopRow from '@components/topRow';
import { StoreState } from '@stores/';
import { BITCOIN_DUST_AMOUNT_SATS } from '@utils/constants';
import { btcToSats, satsToBtc, validateBtcAddress } from '@utils/walletUtils';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function SendBtcScreen({}) {
  const [error, setError] = useState('');
  const {
    btcAddress,
    network,
    btcBalance,
  } = useSelector((state: StoreState) => state.walletState);
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();

  const handleBackButtonClick = () => {
    navigate('/');
  };

  const handleNextClick = (recipientAddress: string, amount: string) => {
   if( validateFields(recipientAddress, amount))
     navigate('/confirm-btc-tx');
  };

  function validateFields(recipientAddress: string, amount: string): boolean {
    if (!recipientAddress) {
      setError(t('ERRORS.ADDRESS_REQUIRED'));
      return false;
    }

    if (!amount) {
      setError(t('ERRORS.AMOUNT_REQUIRED'));
      return false;
    }

    if (!validateBtcAddress(recipientAddress, network)) {
      setError(t('ERRORS.ADDRESS_INVALID'));
      return false;
    }

    if (recipientAddress === btcAddress) {
      setError(t('ERRORS.SEND_TO_SELF'));
      return false;
    }

    var parsedAmount = new BigNumber(0);

    try {
      if (!isNaN(Number(amount))) {
        parsedAmount = new BigNumber(amount);
      } else {
        setError(t('ERRORS.INVALID_AMOUNT'));
        return false;
      }
    } catch (error) {
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
      />
    </>
  );
}

export default SendBtcScreen;
