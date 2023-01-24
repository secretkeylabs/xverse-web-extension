import { useMutation } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateUnsignedStxTokenTransferTransaction } from '@secretkeylabs/xverse-core/transactions';
import { microstacksToStx, stxToMicrostacks } from '@secretkeylabs/xverse-core/currency';
import { StacksTransaction } from '@secretkeylabs/xverse-core/types';
import { validateStxAddress } from '@secretkeylabs/xverse-core/wallet';
import SendForm from '@components/sendForm';
import TopRow from '@components/topRow';
import useStxPendingTxData from '@hooks/useStxPendingTxData';
import { StoreState } from '@stores/index';
import { replaceCommaByDot } from '@utils/helper';
import BottomBar from '@components/tabBar';
import useNetworkSelector from '@hooks/useNetwork';

function SendStxScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();
  const {
    stxAddress, stxAvailableBalance, stxPublicKey, feeMultipliers, network,
  } = useSelector(
    (state: StoreState) => state.walletState,
  );
  const selectedNetwork = useNetworkSelector();
  const [error, setError] = useState('');
  const { data: stxPendingTxData } = useStxPendingTxData();
  const location = useLocation();
  let recipientAddress: string | undefined;
  let amountToSend: string | undefined;
  let stxMemo: string | undefined;

  if (location.state) {
    recipientAddress = location.state.recipientAddress;
    amountToSend = location.state.amountToSend;
    stxMemo = location.state.stxMemo;
  }
  const {
    isLoading, data, mutate,
  } = useMutation<
  StacksTransaction,
  Error,
  { associatedAddress: string; amount: string; memo?: string }
  >(async ({ associatedAddress, amount, memo }) => {
    const unsignedSendStxTx: StacksTransaction = await generateUnsignedStxTokenTransferTransaction(
      associatedAddress,
      stxToMicrostacks(new BigNumber(amount)).toString(),
      memo!,
      stxPendingTxData?.pendingTransactions ?? [],
      stxPublicKey,
      selectedNetwork,
    );
    // increasing the fees with multiplication factor
    const fee: bigint = BigInt(unsignedSendStxTx.auth.spendingCondition.fee.toString()) ?? BigInt(0);
    if (feeMultipliers?.stxSendTxMultiplier) {
      unsignedSendStxTx.setFee(fee * BigInt(feeMultipliers.stxSendTxMultiplier));
    }
    return unsignedSendStxTx;
  });

  useEffect(() => {
    if (data) {
      navigate('/confirm-stx-tx', {
        state: {
          unsignedTx: data,
        },
      });
    }
  }, [data]);

  const handleBackButtonClick = () => {
    navigate(-1);
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
    if (!validateStxAddress({ stxAddress: associatedAddress, network: network.type })) {
      setError(t('ERRORS.ADDRESS_INVALID'));
      return false;
    }

    if (associatedAddress === stxAddress) {
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

  const onPressSendSTX = async (associatedAddress: string, amount: string, memo?: string) => {
    const modifyAmount = replaceCommaByDot(amount);
    const addMemo = memo ?? '';
    if (validateFields(associatedAddress.trim(), modifyAmount, memo!)) {
      setError('');
      mutate({ amount, associatedAddress, memo: addMemo });
    }
  };

  return (
    <>
      <TopRow title={t('SEND')} onClick={handleBackButtonClick} />
      <SendForm
        processing={isLoading}
        currencyType="STX"
        error={error}
        balance={Number(microstacksToStx(new BigNumber(stxAvailableBalance)))}
        onPressSend={onPressSendSTX}
        recipient={recipientAddress!}
        amountToSend={amountToSend!}
        stxMemo={stxMemo!}
      />
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SendStxScreen;
