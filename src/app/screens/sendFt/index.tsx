import SendForm from '@components/sendForm';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useStxPendingTxData from '@hooks/queries/useStxPendingTxData';
import useNetworkSelector from '@hooks/useNetwork';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  StacksTransaction,
  UnsignedStacksTransation,
  applyFeeMultiplier,
  buf2hex,
  generateUnsignedTransaction,
  validateStxAddress,
} from '@secretkeylabs/xverse-core';
import { useMutation } from '@tanstack/react-query';
import { convertAmountToFtDecimalPlaces, ftDecimals, replaceCommaByDot } from '@utils/helper';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

function SendFtScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();
  const { stxAddress, stxPublicKey } = useSelectedAccount();
  const { network, feeMultipliers } = useWalletSelector();
  const { visible: sip10CoinsList } = useVisibleSip10FungibleTokens();
  const [amountError, setAmountError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [memoError, setMemoError] = useState('');
  const [amountToSend, setAmountToSend] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [txMemo, setTxMemo] = useState<string | undefined>(undefined);
  const { data: stxPendingTxData } = useStxPendingTxData();
  const location = useLocation();
  const selectedNetwork = useNetworkSelector();
  const [searchParams] = useSearchParams();

  const principal = searchParams.get('principal');
  const fungibleToken = sip10CoinsList?.find((coin) => coin.principal === principal);

  let recipient: string | undefined;
  let ftAmountToSend: string | undefined;
  let stxMemo: string | undefined;

  if (location.state) {
    recipient = location.state.recipientAddress;
    ftAmountToSend = location.state.amountToSend;
    stxMemo = location.state.stxMemo;
  }
  const { isLoading, data, mutate } = useMutation<
    StacksTransaction | undefined,
    Error,
    { associatedAddress: string; amount: string; memo?: string }
  >({
    mutationFn: async ({ associatedAddress, amount, memo }) => {
      if (!principal || !fungibleToken) return;

      let convertedAmount = amount;
      if (fungibleToken?.decimals) {
        convertedAmount = convertAmountToFtDecimalPlaces(amount, fungibleToken.decimals).toString();
      }
      setAmountToSend(amount);
      setTxMemo(memo);
      setRecipientAddress(associatedAddress);
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
      const unsignedTx = await generateUnsignedTransaction(unsginedTx);
      applyFeeMultiplier(unsignedTx, feeMultipliers);
      return unsignedTx;
    },
  });

  useEffect(() => {
    if (data) {
      navigate('/confirm-ft-tx', {
        state: {
          unsignedTx: buf2hex(data.serialize()),
          amount: amountToSend.toString(),
          fungibleToken,
          memo: txMemo,
          recipientAddress,
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

  const validateFields = (associatedAddress: string, amount: string, memo?: string): boolean => {
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
  };

  const onPressSendSTX = async (associatedAddress: string, amount: string, memo?: string) => {
    const modifyAmount = replaceCommaByDot(amount);
    const addMemo = memo ?? '';
    if (validateFields(associatedAddress.trim(), modifyAmount, memo)) {
      setAddressError('');
      setMemoError('');
      setAmountError('');
      mutate({ amount, associatedAddress, memo: addMemo });
    }
  };

  if (!fungibleToken) {
    navigate('/');
    return null;
  }

  return (
    <>
      <TopRow title={t('SEND')} onClick={handleBackButtonClick} />
      <SendForm
        processing={isLoading}
        currencyType="FT"
        amountError={amountError}
        recipientError={addressError}
        memoError={memoError}
        fungibleToken={fungibleToken}
        balance={Number(getBalance())}
        onPressSend={onPressSendSTX}
        recipient={recipient}
        amountToSend={ftAmountToSend}
        stxMemo={stxMemo}
      />
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SendFtScreen;
