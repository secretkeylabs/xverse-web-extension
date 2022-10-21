import SendForm from '@components/sendForm';
import TopRow from '@components/topRow';
import { btcToSats, satsToBtc } from '@secretkeylabs/xverse-core/currency';
import { validateBtcAddress } from '@secretkeylabs/xverse-core/wallet';
import { BITCOIN_DUST_AMOUNT_SATS } from '@utils/constants';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

function SendBtcScreen() {
  const [error, setError] = useState('');
  const btcAddress = '3QAmUHT9jbsjewuAAjta6mtpH8M4tgQJcE';
  const btcBalance = new BigNumber(120);
  const network = 'Mainnet';
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();

  const handleBackButtonClick = () => {
    navigate('/');
  };

  const handleNextClick = () => {
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

    if (!validateBtcAddress({ btcAddress: recipientAddress, network })) {
      setError(t('ERRORS.ADDRESS_INVALID'));
      return false;
    }

    if (recipientAddress === btcAddress) {
      setError(t('ERRORS.SEND_TO_SELF'));
      return false;
    }

    let parsedAmount = new BigNumber(0);

    try {
      if (!Number.isNaN(Number(amount))) {
        parsedAmount = new BigNumber(amount);
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

  function getBalance() {
    return satsToBtc(btcBalance).toNumber();
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
