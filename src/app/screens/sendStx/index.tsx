import SendForm from '@components/sendForm';
import TopRow from '@components/topRow';
import { replaceCommaByDot } from '@utils/helper';
import { stxToMicrostacks, validateStxAddress } from '@utils/walletUtils';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

function SendStxScreen() {
  const [error, setError] = useState('');
  const stxAddress = 'SP1TWMXZB83X6KJAYEHNYVPAGX60Q9C2NVXBQCJMY';
  const stxAvailableBalance = 120;
  const network = 'Mainnet';
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();
  const handleBackButtonClick = () => {
    navigate('/');
  };

  function validateFields(associatedAddress: string, amount: string, memo: string): boolean {
    if (!associatedAddress) {
      setError(t('ERRORS.ADDRESS_REQUIRED'));
      return false;
    }

    if (!amount) {
      setError(t('ERRORS.AMOUNT_REQUIRED'));
      return false;
    }
    if (!validateStxAddress(associatedAddress, network)) {
      setError(t('ERRORS.ADDRESS_INVALID'));
      return false;
    }

    if (associatedAddress === stxAddress) {
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

    if (stxToMicrostacks(parsedAmount).lt(1)) {
      setError(t('ERRORS.MINIMUM_AMOUNT'));
      return false;
    }

    if (stxToMicrostacks(parsedAmount).gt(stxAvailableBalance)) {
      setError(t('ERRORS.INSUFFICIENT_BALANCE'));
      return false;
    }

    if (memo) {
      if (Buffer.from(memo).byteLength >= 34) {
        setError(t('ERRORS.MEMO_LENGTH'));
        return false;
      }
    }
    return true;
  }

  async function onPressSendSTX(associatedAddress: string, amount: string, memo: string) {
    amount = replaceCommaByDot(amount);
    if (validateFields(associatedAddress.trim(), amount, memo)) {
      setError('');
      navigate('/confirm-stx-tx');
      //generateStxTx(amount, associatedAddress, memo);
    }
    navigate('/confirm-stx-tx');
  }
  return (
    <>
      <TopRow title={t('SEND')} onClick={handleBackButtonClick} />
      <SendForm currencyType="STX" error={error} balance={10000} onPressSend={onPressSendSTX} />
    </>
  );
}

export default SendStxScreen;
