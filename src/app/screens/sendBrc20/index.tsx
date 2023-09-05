import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  Brc20TransferEstimateFeesParams,
  ConfirmBrc20TransferState,
  SendBrc20TransferState,
} from '@utils/brc20';
import { BRC20ErrorCode } from '@secretkeylabs/xverse-core/transactions/brc20';
import {
  UTXO,
  brc20TransferEstimateFees,
  getNonOrdinalUtxo,
  validateBtcAddress,
  CoreError,
} from '@secretkeylabs/xverse-core';
import { getFtTicker } from '@utils/tokens';
import { replaceCommaByDot } from '@utils/helper';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import { useTranslation } from 'react-i18next';
import Brc20TransferForm from './brc20TransferForm';

function SendBrc20Screen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND_BRC20' });
  const navigate = useNavigate();
  const location = useLocation();
  const { btcAddress, ordinalsAddress, network, brcCoinsList } = useWalletSelector();
  const { data: feeRate } = useBtcFeeRate();
  const [amountError, setAmountError] = useState('');
  const [amountToSend, setAmountToSend] = useState('');
  const [recipientError, setRecipientError] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [processing, setProcessing] = useState(false);

  const { subscribeToResetUserFlow } = useResetUserFlow();
  useEffect(() => subscribeToResetUserFlow('/send-brc20'), []); // eslint-disable-line react-hooks/exhaustive-deps

  const isNextEnabled =
    !amountError && !recipientError && !!recipientAddress && amountToSend !== '';

  const { fungibleToken: ft }: SendBrc20TransferState = location.state;
  const coinName = location.search ? location.search.split('coinName=')[1] : undefined;
  const fungibleToken = ft || brcCoinsList?.find((coin) => coin.name === coinName);

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const validateAmount = (amountInput: string): boolean => {
    const amount = Number(replaceCommaByDot(amountInput));
    if (amount > Number(fungibleToken.balance)) {
      setAmountError(t('ERRORS.INSUFFICIENT_BALANCE'));
      return false;
    }
    if (!Number.isFinite(amount) || amount === 0) {
      setAmountError(t('ERRORS.AMOUNT_REQUIRED'));
      return false;
    }
    setAmountError('');
    return true;
  };

  const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    const resultRegex = /^\d*\.?\d*$/;
    if (resultRegex.test(newValue)) {
      validateAmount(newValue);
      setAmountToSend(newValue);
    }
  };

  const validateRecipientAddress = (address: string): boolean => {
    if (!address) {
      setRecipientError(t('ERRORS.ADDRESS_REQUIRED'));
      return false;
    }
    if (
      !validateBtcAddress({
        btcAddress: address,
        network: network.type,
      })
    ) {
      setRecipientError(t('ERRORS.ADDRESS_INVALID'));
      return false;
    }
    setRecipientError('');
    return true;
  };

  const onAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateRecipientAddress(e.target.value);
    setRecipientAddress(e.target.value);
  };

  const handleOnPressNext = async () => {
    try {
      if (
        !validateAmount(amountToSend) ||
        !validateRecipientAddress(recipientAddress) ||
        !feeRate
      ) {
        return;
      }
      setProcessing(true);

      // TODO get this from store or cache?
      const addressUtxos: UTXO[] = await getNonOrdinalUtxo(btcAddress, network.type);
      const ticker = getFtTicker(fungibleToken);
      const numberAmount = Number(replaceCommaByDot(amountToSend));
      const estimateFeesParams: Brc20TransferEstimateFeesParams = {
        addressUtxos,
        tick: ticker,
        amount: numberAmount,
        revealAddress: ordinalsAddress,
        feeRate: feeRate?.regular,
      };
      const estimatedFees = await brc20TransferEstimateFees(estimateFeesParams);
      const state: ConfirmBrc20TransferState = {
        recipientAddress,
        estimateFeesParams,
        estimatedFees,
        token: fungibleToken,
      };
      navigate('/confirm-brc20-tx', { state });
    } catch (err) {
      const e = err as Error;
      if (
        CoreError.isCoreError(e) &&
        (e.code ?? '') in BRC20ErrorCode &&
        e.code === BRC20ErrorCode.INSUFFICIENT_FUNDS
      ) {
        setAmountError(t('ERRORS.INSUFFICIENT_BALANCE_FEES'));
      } else {
        setAmountError(t('ERRORS.SERVER_ERROR'));
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <TopRow title={t('SEND')} onClick={handleBackButtonClick} />
      <Brc20TransferForm
        amountToSend={amountToSend}
        onAmountChange={onInputChange}
        amountError={amountError}
        token={fungibleToken}
        recipientAddress={recipientAddress}
        recipientError={recipientError}
        onAddressChange={onAddressInputChange}
        onPressNext={handleOnPressNext}
        processing={processing}
        isNextEnabled={isNextEnabled}
      />
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SendBrc20Screen;
