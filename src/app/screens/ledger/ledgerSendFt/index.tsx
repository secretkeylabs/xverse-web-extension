import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateUnsignedTransaction } from '@secretkeylabs/xverse-core/transactions';
import { StacksTransaction, UnsignedStacksTransation } from '@secretkeylabs/xverse-core/types';
import { validateStxAddress } from '@secretkeylabs/xverse-core/wallet';
import SendForm from '@components/sendForm';
import TopRow from '@components/topRow';
import useStxPendingTxData from '@hooks/queries/useStxPendingTxData';
import { StoreState } from '@stores/index';
import { convertAmountToFtDecimalPlaces, ftDecimals, replaceCommaByDot } from '@utils/helper';
import useNetworkSelector from '@hooks/useNetwork';
import { FungibleToken } from '@secretkeylabs/xverse-core';
import FullScreenHeader from '@components/ledger/fullScreenHeader';

function LedgerSendFtScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();
  const { stxAddress, stxPublicKey, network, feeMultipliers, coinsList } = useSelector(
    (state: StoreState) => state.walletState
  );

  const [amountError, setAmountError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [memoError, setMemoError] = useState('');
  const [amountToSend, setAmountToSend] = useState('');
  const [recepientAddress, setRecepientAddress] = useState('');
  const [txMemo, setTxMemo] = useState<string | undefined>(undefined);
  const { data: stxPendingTxData } = useStxPendingTxData();
  const location = useLocation();
  const selectedNetwork = useNetworkSelector();
  let recipientAddress: string | undefined;
  let ftAmountToSend: string | undefined;
  let stxMemo: string | undefined;

  if (location.state) {
    recipientAddress = location.state.recipientAddress;
    ftAmountToSend = location.state.amountToSend;
    stxMemo = location.state.stxMemo;
  }

  const fungibleToken: FungibleToken | undefined = useMemo(() => {
    if (!location.search) return undefined;
    const params = new URLSearchParams(location.search);
    const coinName = params.get('coin');
    const selected = coinsList?.find((coin) => coin.name === coinName);

    return selected;
  }, [location.search, coinsList]);

  const { isLoading, data, mutate } = useMutation<
    StacksTransaction,
    Error,
    { associatedAddress: string; amount: string; memo?: string; fungibleToken: FungibleToken }
  >(async ({ associatedAddress, amount, memo, fungibleToken }) => {
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
      network: selectedNetwork,
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
      navigate('/review-ledger-ft-tx', {
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

  const getBalance = (): any => {
    if (!fungibleToken) return 0;
    if (fungibleToken?.decimals) {
      return ftDecimals(fungibleToken.balance, fungibleToken.decimals);
    }
    return fungibleToken?.balance;
  };

  function validateFields(associatedAddress: string, amount: string, memo: string): boolean {
    if (!associatedAddress) {
      setAddressError(t('ERRORS.ADDRESS_REQUIRED'));
      return false;
    }

    if (!amount) {
      setAmountError(t('ERRORS.AMOUNT_REQUIRED'));
      return false;
    }
    if (!validateStxAddress({ stxAddress: associatedAddress, network: network.type })) {
      setAddressError(t('ERRORS.ADDRESS_INVALID'));
      return false;
    }

    if (associatedAddress === stxAddress) {
      setAddressError(t('ERRORS.SEND_TO_SELF'));
      return false;
    }

    if (Number(amount) <= 0) {
      setAmountError(t('ERRORS.INVALID_AMOUNT'));
      return false;
    }

    if (fungibleToken?.decimals && amount.split('.')[1]?.length > fungibleToken.decimals) {
      setAmountError(t('ERRORS.INVALID_AMOUNT'));
      return false;
    }

    if (fungibleToken?.decimals === 0 && amount.indexOf('.') !== -1) {
      setAmountError(t('ERRORS.INVALID_AMOUNT'));
      return false;
    }

    const ftBalance = fungibleToken?.decimals
      ? ftDecimals(fungibleToken.balance, fungibleToken.decimals)
      : fungibleToken?.balance;

    try {
      if (Number.isNaN(Number(amount))) {
        setAmountError(t('ERRORS.INVALID_AMOUNT'));
        return false;
      }
      if (Number(amount) > Number(ftBalance)) {
        setAmountError(t('ERRORS.INSUFFICIENT_BALANCE'));
        return false;
      }
    } catch (e) {
      setAmountError(t('ERRORS.INVALID_AMOUNT'));
      return false;
    }

    if (memo) {
      if (Buffer.from(memo).byteLength >= 34) {
        setMemoError(t('ERRORS.MEMO_LENGTH'));
        return false;
      }
    }

    return true;
  }

  const onPressSendSTX = async (associatedAddress: string, amount: string, memo?: string) => {
    if (!fungibleToken) return;
    const modifyAmount = replaceCommaByDot(amount);
    const addMemo = memo ?? '';
    if (validateFields(associatedAddress.trim(), modifyAmount, memo!)) {
      setAddressError('');
      setMemoError('');
      setAmountError('');
      mutate({ amount, associatedAddress, memo: addMemo, fungibleToken });
    }
  };

  return (
    <>
      <FullScreenHeader />
      <TopRow title={t('SEND')} onClick={handleBackButtonClick} showBackButton={false} />
      <SendForm
        processing={isLoading}
        currencyType="FT"
        amountError={amountError}
        recepientError={addressError}
        memoError={memoError}
        fungibleToken={fungibleToken}
        balance={getBalance()}
        onPressSend={onPressSendSTX}
        recipient={recipientAddress!}
        amountToSend={ftAmountToSend!}
        stxMemo={stxMemo!}
      />
    </>
  );
}

export default LedgerSendFtScreen;
