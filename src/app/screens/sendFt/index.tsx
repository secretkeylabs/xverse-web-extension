import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateUnsignedTransaction } from '@secretkeylabs/xverse-core/transactions';
import { StacksTransaction, UnsignedStacksTransation } from '@secretkeylabs/xverse-core/types';
import { validateStxAddress } from '@secretkeylabs/xverse-core/wallet';
import SendForm from '@components/sendForm';
import TopRow from '@components/topRow';
import useStxPendingTxData from '@hooks/useStxPendingTxData';
import { StoreState } from '@stores/index';
import {
  convertAmountToFtDecimalPlaces, ftDecimals, replaceCommaByDot,
} from '@utils/helper';
import BottomBar from '@components/tabBar';

function SendFtScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();
  const {
    stxAddress, stxPublicKey, network, feeMultipliers,
  } = useSelector(
    (state: StoreState) => state.walletState,
  );
  const [error, setError] = useState('');
  const [amountToSend, setAmountToSend] = useState('');
  const [recepientAddress, setRecepientAddress] = useState('');
  const [txMemo, setTxMemo] = useState<string | undefined>(undefined);
  const { data: stxPendingTxData } = useStxPendingTxData();
  const location = useLocation();
  const { fungibleToken } = location.state;
  let recipientAddress: string | undefined;
  let ftAmountToSend: string | undefined;
  let stxMemo: string | undefined;

  if (location.state) {
    recipientAddress = location.state.recipientAddress;
    ftAmountToSend = location.state.amountToSend;
    stxMemo = location.state.stxMemo;
  }
  const { isLoading, data, mutate } = useMutation<
  StacksTransaction,
  Error,
  { associatedAddress: string; amount: string; memo?: string }
  >(async ({ associatedAddress, amount, memo }) => {
    let convertedAmount = amount;
    if (fungibleToken?.decimals) {
      convertedAmount = convertAmountToFtDecimalPlaces(amount, fungibleToken.decimals).toString();
    }
    setAmountToSend(amount);
    setTxMemo(memo);
    setRecepientAddress(associatedAddress);
    const { principal } = fungibleToken;
    const contractInfo: string[] = principal.split('.');
    const unsginedTx: UnsignedStacksTransation = {
      amount: convertedAmount,
      senderAddress: stxAddress,
      recipientAddress: associatedAddress,
      contractAddress: contractInfo[0],
      contractName: contractInfo[1],
      assetName: fungibleToken?.assetName ?? '',
      publicKey: stxPublicKey,
      network,
      pendingTxs: stxPendingTxData?.pendingTransactions ?? [],
      memo,
    };
    const unsignedTx: StacksTransaction = await generateUnsignedTransaction(unsginedTx);

    const fee: bigint = BigInt(unsignedTx.auth.spendingCondition.fee.toString()) ?? BigInt(0);
    if (feeMultipliers?.stxSendTxMultiplier) {
      unsignedTx.setFee(fee * BigInt(feeMultipliers.stxSendTxMultiplier));
    }

    return unsignedTx;
  });

  useEffect(() => {
    if (data) {
      navigate('/confirm-ft-tx', {
        state: {
          unsignedTx: data,
          amount: amountToSend.toString(),
          fungibleToken,
          memo: txMemo,
          recepientAddress,
        },
      });
    }
  }, [data]);

  const handleBackButtonClick = () => {
    navigate('/');
  };

  const getBalance = () => {
    if (fungibleToken?.decimals) {
      return ftDecimals(fungibleToken.balance, fungibleToken.decimals);
    }
    return fungibleToken?.balance;
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

    if (Number(amount) <= 0) {
      setError(t('ERRORS.INVALID_AMOUNT'));
      return false;
    }

    if (
      fungibleToken?.decimals
        && amount.split('.')[1]?.length > fungibleToken.decimals
    ) {
      setError(t('ERRORS.INVALID_AMOUNT'));
      return false;
    }

    if (fungibleToken?.decimals === 0 && amount.indexOf('.') !== -1) {
      setError(t('ERRORS.INVALID_AMOUNT'));
      return false;
    }

    const ftBalance = fungibleToken?.decimals
      ? ftDecimals(fungibleToken.balance, fungibleToken.decimals)
      : fungibleToken?.balance;

    try {
      if (Number.isNaN(Number(amount))) {
        setError(t('ERRORS.INVALID_AMOUNT'));
        return false;
      }
      if (Number(amount) > Number(ftBalance)) {
        setError(t('ERRORS.INSUFFICIENT_BALANCE'));
        return false;
      }
    } catch (e) {
      setError(t('ERRORS.INVALID_AMOUNT'));
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
        currencyType="FT"
        error={error}
        fungibleToken={fungibleToken}
        balance={getBalance()}
        onPressSend={onPressSendSTX}
        recipient={recipientAddress!}
        amountToSend={ftAmountToSend!}
        stxMemo={stxMemo!}
      />
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SendFtScreen;
