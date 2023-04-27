import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import SendForm from '@components/sendForm';
import TopRow from '@components/topRow';
import { StoreState } from '@stores/index';
import { btcToSats, satsToBtc } from '@secretkeylabs/xverse-core/currency';
import { validateBtcAddress } from '@secretkeylabs/xverse-core/wallet';
import { BITCOIN_DUST_AMOUNT_SATS } from '@utils/constants';
import { Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import FullScreenHeader from '@components/ledger/fullScreenHeader';
import { isLedgerAccount } from '@utils/helper';

function LedgerSendBtcScreen() {
  const location = useLocation();
  let enteredAddress: string | undefined;
  let enteredAmountToSend: string | undefined;
  if (location.state) {
    enteredAddress = location.state.recipientAddress;
    enteredAmountToSend = location.state.amount;
  }
  const [amountError, setAmountError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [recipientAddress, setRecipientAddress] = useState(enteredAddress ?? '');
  const [amount, setAmount] = useState(enteredAmountToSend ?? '');
  const { btcAddress, network, btcBalance, selectedAccount } = useSelector(
    (state: StoreState) => state.walletState
  );
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLedgerAccount(selectedAccount)) {
      navigate('/');
    }
  }, [selectedAccount]);

  function validateFields(address: string, amountToSend: string): boolean {
    if (!address) {
      setAddressError(t('ERRORS.ADDRESS_REQUIRED'));
      return false;
    }

    if (!amountToSend) {
      setAmountError(t('ERRORS.AMOUNT_REQUIRED'));
      return false;
    }

    if (!validateBtcAddress({ btcAddress: address, network: network.type })) {
      setAddressError(t('ERRORS.ADDRESS_INVALID'));
      return false;
    }

    if (address === btcAddress) {
      setAddressError(t('ERRORS.SEND_TO_SELF'));
      return false;
    }

    let parsedAmount = new BigNumber(0);

    try {
      if (!Number.isNaN(Number(amountToSend))) {
        parsedAmount = new BigNumber(amountToSend);
      } else {
        setAmountError(t('ERRORS.INVALID_AMOUNT'));
        return false;
      }
    } catch (e) {
      setAmountError(t('ERRORS.INVALID_AMOUNT'));
      return false;
    }

    if (parsedAmount.isZero()) {
      setAmountError(t('ERRORS.INVALID_AMOUNT'));
      return false;
    }

    if (btcToSats(parsedAmount).lt(BITCOIN_DUST_AMOUNT_SATS)) {
      setAmountError(t('ERRORS.BELOW_MINIMUM_AMOUNT'));
      return false;
    }

    if (btcToSats(parsedAmount).gt(btcBalance)) {
      setAmountError(t('ERRORS.INSUFFICIENT_BALANCE_FEES'));
      return false;
    }
    return true;
  }

  const handleNextClick = async (address: string, amountToSend: string) => {
    setRecipientAddress(address);
    setAmount(amountToSend);
    const btcRecipient: Recipient = {
      address,
      amountSats: btcToSats(new BigNumber(amountToSend)),
    };

    if (validateFields(address, amountToSend)) {
      navigate('/review-ledger-btc-tx', {
        state: {
          recipientAddress,
          amount,
          recipient: btcRecipient,
        },
      });
    }
  };

  function getBalance() {
    return satsToBtc(new BigNumber(btcBalance)).toNumber();
  }

  return (
    <>
      <FullScreenHeader />
      <TopRow title={t('SEND')} onClick={() => {}} showBackButton={false} />
      <SendForm
        currencyType="BTC"
        amountError={amountError}
        recepientError={addressError}
        balance={getBalance()}
        onPressSend={handleNextClick}
        recipient={recipientAddress}
        amountToSend={amount}
        processing={recipientAddress !== '' && amount !== ''}
      />
    </>
  );
}

export default LedgerSendBtcScreen;
