import SendForm from '@components/sendForm';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';
import { ErrorCodes, ResponseError } from '@secretkeylabs/xverse-core';
import { btcToSats, getBtcFiatEquivalent, satsToBtc } from '@secretkeylabs/xverse-core/currency';
import { signBtcTransaction } from '@secretkeylabs/xverse-core/transactions';
import { Recipient, SignedBtcTx } from '@secretkeylabs/xverse-core/transactions/btc';
import { validateBtcAddress } from '@secretkeylabs/xverse-core/wallet';
import { useMutation } from '@tanstack/react-query';
import { BITCOIN_DUST_AMOUNT_SATS } from '@utils/constants';
import { isInOptions } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const [warning, setWarning] = useState('');
  const [recipient, setRecipient] = useState<Recipient[]>();
  const [amount, setAmount] = useState(enteredAmountToSend ?? '');
  const { btcAddress, network, btcBalance, selectedAccount, btcFiatRate } = useWalletSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();
  const { getSeed } = useSeedVault();
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
      seedPhrase: string;
    }
  >({
    mutationFn: async ({ recipients, seedPhrase }) =>
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
          fiatAmount: getBtcFiatEquivalent(parsedAmountSats, BigNumber(btcFiatRate)),
          fee: data.fee,
          feePerVByte: data.feePerVByte,
          fiatFee: getBtcFiatEquivalent(data.fee, BigNumber(btcFiatRate)),
          total: data.total,
          fiatTotal: getBtcFiatEquivalent(data.total, BigNumber(btcFiatRate)),
        },
      });
    }
  }, [data]);

  useResetUserFlow('/send-btc');

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
    const seedPhrase = await getSeed();
    const recipients: Recipient[] = [
      {
        address,
        amountSats: btcToSats(new BigNumber(amountToSend)),
      },
    ];
    setRecipient(recipients);
    if (validateFields(address, amountToSend)) {
      mutate({ recipients, seedPhrase });
    }
  };

  function getBalance() {
    return satsToBtc(new BigNumber(btcBalance)).toNumber();
  }

  const showNavButtons = !isInOptions();

  const handleInputChange = (inputAddress: string) => {
    if (inputAddress === btcAddress) {
      return setWarning(t('SEND_BTC_TO_SELF_WARNING'));
    }
    setWarning('');
  };

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
        onAddressInputChange={handleInputChange}
        warning={warning}
      />
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SendBtcScreen;
