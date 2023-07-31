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
import { Recipient, SignedBtcTx } from '@secretkeylabs/xverse-core/transactions/btc';
import { ErrorCodes, ResponseError } from '@secretkeylabs/xverse-core';
import { isInOptions } from '@utils/helper';
import { useResetUserFlow } from '@hooks/useResetUserFlow';

function SendBtcScreen() {
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
  const [recipient, setRecipient] = useState<Recipient[]>();
  const [amount, setAmount] = useState(enteredAmountToSend ?? '');
  const { btcAddress, network, btcBalance, selectedAccount, seedPhrase, btcFiatRate } = useSelector(
    (state: StoreState) => state.walletState,
  );
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });

  const navigate = useNavigate();
  const {
    isLoading,
    data,
    error: txError,
    mutate,
  } = useMutation<
    SignedBtcTx,
    ResponseError,
    {
      recipients: Recipient[];
    }
  >({
    mutationFn: async ({ recipients }) =>
      signBtcTransaction(
        recipients,
        btcAddress,
        selectedAccount?.id ?? 0,
        seedPhrase,
        network.type,
      ),
  });

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
          recipient,
          fiatAmount: getBtcFiatEquivalent(parsedAmountSats, btcFiatRate),
          fee: data.fee,
          feePerVByte: data.feePerVByte,
          fiatFee: getBtcFiatEquivalent(data.fee, btcFiatRate),
          total: data.total,
          fiatTotal: getBtcFiatEquivalent(data.total, btcFiatRate),
        },
      });
    }
  }, [data]);

  const { subscribeToResetUserFlow } = useResetUserFlow();
  useEffect(() => subscribeToResetUserFlow('/send-btc'), []);

  useEffect(() => {
    if (recipientAddress && amount && txError) {
      if (Number(txError) === ErrorCodes.InSufficientBalance) {
        setAmountError(t('ERRORS.INSUFFICIENT_BALANCE'));
      } else if (Number(txError) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setAmountError(t('ERRORS.INSUFFICIENT_BALANCE_FEES'));
      } else setAmountError(txError.toString());
    }
  }, [txError]);

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
    const recipients: Recipient[] = [
      {
        address,
        amountSats: btcToSats(new BigNumber(amountToSend)),
      },
    ];
    setRecipient(recipients);
    if (validateFields(address, amountToSend)) {
      mutate({ recipients });
    }
  };

  function getBalance() {
    return satsToBtc(new BigNumber(btcBalance)).toNumber();
  }

  const showNavButtons = !isInOptions();

  return (
    <>
      <TopRow title={t('SEND')} onClick={handleBackButtonClick} showBackButton={showNavButtons} />
      <SendForm
        currencyType="BTC"
        amountError={amountError}
        recepientError={addressError}
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
