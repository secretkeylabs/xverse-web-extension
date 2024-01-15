import ConfirmBitcoinTransaction from '@components/confirmBtcTransaction';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  btcToSats,
  btcTransaction,
  getBtcFiatEquivalent,
  satsToBtc,
  validateBtcAddress,
} from '@secretkeylabs/xverse-core';
import { BITCOIN_DUST_AMOUNT_SATS } from '@utils/constants';
import { isInOptions } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { generateSendMaxTransaction, generateTransaction } from './helpers';

const Container = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
  padding: 0 16px;
  margin-top: 16px;
`;

const AmountContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

function SendBtcScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();

  const { btcAddress, network, btcBalance, btcFiatRate } = useWalletSelector();
  useResetUserFlow('/send-btc');

  const location = useLocation();
  let enteredAddress = '2N3J2uER8xjdNCpBfaA7K4kWpg9EbJfwfUu';
  let enteredAmountToSend = '0.0001';
  if (location.state) {
    enteredAddress = location.state.recipientAddress;
    enteredAmountToSend = location.state.amount;
  }

  const [recipientAddress, setRecipientAddress] = useState(enteredAddress);
  const [amount, setAmount] = useState(enteredAmountToSend);
  const [feeRate, setFeeRate] = useState('1');
  const [addressError, setAddressError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [warning, setWarning] = useState('');

  const transactionContext = useTransactionContext();
  const [transaction, setTransaction] = useState<btcTransaction.EnhancedTransaction | undefined>();
  const [sendMax, setSendMax] = useState(false);
  const [summary, setSummary] = useState<btcTransaction.TransactionSummary | undefined>();

  useEffect(() => {
    // TODO: validate properly
    if (!recipientAddress || !amount || !feeRate) {
      setTransaction(undefined);
      return;
    }

    const amountBigInt = BigInt(btcToSats(new BigNumber(amount)).toNumber());

    const generate = async () => {
      const transactionDetails = sendMax
        ? await generateSendMaxTransaction(transactionContext, recipientAddress, +feeRate)
        : await generateTransaction(transactionContext, recipientAddress, amountBigInt, +feeRate);

      setTransaction(transactionDetails.transaction);

      setSummary(transactionDetails.summary);
    };

    generate();
  }, [transactionContext, recipientAddress, amount, feeRate, sendMax]);

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

  const handleBackButtonClick = () => {
    navigate('/');
  };

  function getBalance() {
    return satsToBtc(new BigNumber(btcBalance)).toNumber();
  }

  const showNavButtons = !isInOptions();

  const handleRecipientChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    if (newAddress === btcAddress) {
      setWarning(t('SEND_BTC_TO_SELF_WARNING'));
    } else {
      setWarning('');
    }

    setRecipientAddress(newAddress);
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setSendMax(false);
  };

  return (
    <>
      <TopRow title={t('SEND')} onClick={handleBackButtonClick} showBackButton={showNavButtons} />
      <Container>
        <div>{warning}</div>
        <div>Recipient</div>
        <input type="text" value={recipientAddress} onChange={handleRecipientChange} />
        <div>{addressError}</div>
        <AmountContainer>
          <div>BTC amount</div>
          <div>Balance: {getBalance()} BTC</div>
          <div>{amountError}</div>
        </AmountContainer>
        <input type="text" value={amount} onChange={handleAmountChange} />
        <div>
          {getBtcFiatEquivalent(btcToSats(new BigNumber(amount)), BigNumber(btcFiatRate))
            .toNumber()
            .toFixed(2)}{' '}
          USD
        </div>
        <div>
          <input
            type="checkbox"
            checked={sendMax}
            onChange={(e) => {
              setSendMax(e.target.checked);
            }}
          />
          Send max
        </div>
        <div>
          Fee rate (sats/byte)
          <input
            type="text"
            value={feeRate}
            onChange={(e) => {
              setFeeRate(e.target.value);
            }}
          />
        </div>
        <div>
          {summary && (
            <ConfirmBitcoinTransaction
              inputs={summary.inputs}
              outputs={summary.outputs}
              feeOutput={summary.feeOutput}
              isLoading={false}
              isSubmitting={false}
              confirmText={t('CONFIRM')}
              cancelText={t('CANCEL')}
              onCancel={() => {}}
              onConfirm={async () => {
                await transaction?.broadcast();
                navigate('/');
              }}
              isBroadcast
              hideBottomBar
              showAccountHeader
            />
          )}
        </div>
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SendBtcScreen;
