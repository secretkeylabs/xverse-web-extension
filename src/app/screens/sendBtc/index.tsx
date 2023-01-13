import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import SendForm from '@components/sendForm';
import TopRow from '@components/topRow';
import BottomBar from '@components/tabBar';
import { StoreState } from '@stores/index';
import { signBtcTransaction } from '@secretkeylabs/xverse-core/transactions';
import { btcToSats, getBtcFiatEquivalent, satsToBtc } from '@secretkeylabs/xverse-core/currency';
import { validateBtcAddress } from '@secretkeylabs/xverse-core/wallet';
import { BITCOIN_DUST_AMOUNT_SATS } from '@utils/constants';
import { SignedBtcTxResponse } from '@secretkeylabs/xverse-core/transactions/btc';
import { ErrorCodes, ResponseError } from '@secretkeylabs/xverse-core';

function SendBtcScreen() {
  const location = useLocation();
  let enteredAddress: string | undefined;
  let enteredAmountToSend: string | undefined;
  if (location.state) {
    enteredAddress = location.state.recipientAddress;
    enteredAmountToSend = location.state.amount;
  }
  const [error, setError] = useState('');
  const [recipientAddress, setRecipientAddress] = useState(enteredAddress ?? '');
  const [amount, setAmount] = useState(enteredAmountToSend ?? '');
  const {
    btcAddress,
    network,
    btcBalance,
    selectedAccount,
    seedPhrase,
    btcFiatRate,
  } = useSelector((state: StoreState) => state.walletState);
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });

  const navigate = useNavigate();
  const {
    isLoading,
    data,
    error: txError,
    mutate,
  } = useMutation<
  SignedBtcTxResponse,
  ResponseError,
  {
    address: string;
    amountToSend: string;
  }
  >(async ({ address, amountToSend }) => signBtcTransaction({
    recipientAddress: address,
    btcAddress,
    amount: amountToSend,
    index: selectedAccount?.id ?? 0,
    fee: undefined,
    seedPhrase,
    network: network.type,
  }));

  const handleBackButtonClick = () => {
    navigate('/');
  };

  useEffect(() => {
    if (data) {
      const parsedAmountSats = btcToSats(new BigNumber(amount));
      navigate('/confirm-btc-tx', {
        state: {
          signedTxHex: data.signedTx,
          recipientAddress,
          amount,
          fiatAmount: getBtcFiatEquivalent(parsedAmountSats, btcFiatRate),
          fee: data.fee,
          fiatFee: getBtcFiatEquivalent(data.fee, btcFiatRate),
          total: data.total,
          fiatTotal: getBtcFiatEquivalent(data.total, btcFiatRate),
        },
      });
    }
  }, [data]);

  useEffect(() => {
    if (recipientAddress && amount && txError) {
      if (Number(txError) === ErrorCodes.InSufficientBalance) { setError(t('ERRORS.INSUFFICIENT_BALANCE')); } else if (Number(txError) === ErrorCodes.InSufficientBalanceWithTxFee) { setError(t('ERRORS.INSUFFICIENT_BALANCE_FEES')); } else setError(txError.toString());
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

    if (!validateBtcAddress({ btcAddress: address, network: network.type })) {
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
      setError(t('ERRORS.BELOW_MINIMUM_AMOUNT'));
      return false;
    }

    if (btcToSats(parsedAmount).gt(btcBalance)) {
      setError(t('ERRORS.INSUFFICIENT_BALANCE_FEES'));
      return false;
    }
    return true;
  }

  const handleNextClick = async (address: string, amountToSend: string) => {
    setRecipientAddress(address);
    setAmount(amountToSend);
    if (validateFields(address, amountToSend)) { mutate({ address, amountToSend }); }
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
        recipient={recipientAddress}
        amountToSend={amount}
        processing={recipientAddress !== '' && amount !== '' && isLoading}
      />
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SendBtcScreen;
