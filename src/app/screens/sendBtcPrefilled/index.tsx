import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SendForm from '@components/sendForm';
import TopRow from '@components/topRow';
import BottomBar from '@components/tabBar';
import { StoreState } from '@stores/index';
import { signBtcTransaction } from '@secretkeylabs/xverse-core/transactions';
import { btcToSats, getBtcFiatEquivalent, satsToBtc } from '@secretkeylabs/xverse-core/currency';
import { validateBtcAddress } from '@secretkeylabs/xverse-core/wallet';
import { BITCOIN_DUST_AMOUNT_SATS } from '@utils/constants';
import { SignedBtcTx, Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import { ErrorCodes } from '@secretkeylabs/xverse-core';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';

function SendBtcPrefilledScreen() {
  const location = useLocation();
  const { r } = useParams();
  let enteredAmountToSend: string | undefined;
  if (location.state) {
    enteredAmountToSend = location.state.amount;
  }
  const {
    btcAddress,
    network,
    btcBalance,
    selectedAccount,
    seedPhrase,
    btcFiatRate,
    dlcBtcAddress,
  } = useSelector((state: StoreState) => state.walletState);
  const [amountError, setAmountError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [recipientAddress, setRecipientAddress] = useState(
    r === 'nested' ? btcAddress : dlcBtcAddress,
  );
  const senderAddress = r === 'nested' ? dlcBtcAddress : btcAddress;
  const [recipient, setRecipient] = useState<Recipient[]>();
  const [amount, setAmount] = useState(enteredAmountToSend ?? '');
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { refetch } = useBtcWalletData();

  const navigate = useNavigate();
  const {
    isLoading,
    data,
    error: txError,
    mutate,
  } = useMutation<
  SignedBtcTx,
  Error,
  {
    recipients: Recipient[];
  }
  >(async ({ recipients }) => signBtcTransaction(recipients, senderAddress, selectedAccount?.id ?? 0, seedPhrase, network.type));

  const handleBackButtonClick = () => {
    navigate('/dlc-list');
  };

  useEffect(() => {
    refetch();
  }, []);

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
          fiatFee: getBtcFiatEquivalent(data.fee, btcFiatRate),
          total: data.total,
          fiatTotal: getBtcFiatEquivalent(data.total, btcFiatRate),
        },
      });
    }
  }, [data]);

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

    if (address === senderAddress) {
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

  return (
    <>
      <TopRow title={t('SEND')} onClick={handleBackButtonClick} />
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
      <BottomBar tab="dlc" />
    </>
  );
}

export default SendBtcPrefilledScreen;
