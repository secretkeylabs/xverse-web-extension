import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  validateBtcAddress,
  UTXO,
  getNonOrdinalUtxo,
  brc20TransferEstimateFees,
} from '@secretkeylabs/xverse-core';
// import { useBrc20TransferFees } from '@secretkeylabs/xverse-core/hooks';
// TODO get from import
// import { ErrorCode } from '@secretkeylabs/xverse-core/dist/hooks/brc20/useBrc20TransferFees';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import TopRow from '@components/topRow';
import BottomBar from '@components/tabBar';
import { replaceCommaByDot } from '@utils/helper';
import { getFtTicker } from '@utils/tokens';
import Brc20TransferForm from './brc20TransferForm';
import { Brc20TransferEstimateFeesParams, ConfirmBrc20TransferState } from '@utils/brc20';

function SendBrc20Screen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND_BRC_20' });
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
  useEffect(() => subscribeToResetUserFlow('/send-brc20'), [subscribeToResetUserFlow]);

  const isNextEnabled =
    !amountError && !recipientError && !!recipientAddress && amountToSend !== '';

  const coinName = location.search ? location.search.split('coinName=')[1] : undefined;
  const fungibleToken =
    location.state?.fungibleToken || brcCoinsList?.find((coin) => coin.name === coinName);

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const validateAmount = (amountInput: string): boolean => {
    const amount = Number(replaceCommaByDot(amountInput));
    if (amount > fungibleToken.balance) {
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
    if (!resultRegex.test(newValue)) {
      setAmountToSend('');
    } else {
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
      setProcessing(true);

      if (
        !validateAmount(amountToSend) ||
        !validateRecipientAddress(recipientAddress) ||
        !feeRate
      ) {
        return setProcessing(false);
      }

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
      };
      navigate('/confirm-brc20-tx', { state });
    } catch (e) {
      console.error(e);
      // TODO use error codes once they are exported
      if ((e as any).message === 'Not enough funds at selected fee rate') {
        setAmountError(t('ERRORS.INSUFFICIENT_BALANCE_FEES'));
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
