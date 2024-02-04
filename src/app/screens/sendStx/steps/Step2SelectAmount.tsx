import useStxPendingTxData from '@hooks/queries/useStxPendingTxData';
import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  StacksTransaction,
  applyFeeMultiplier,
  buf2hex,
  generateUnsignedStxTokenTransferTransaction,
  getStxFiatEquivalent,
  microstacksToStx,
  stxToMicrostacks,
} from '@secretkeylabs/xverse-core';
import { deserializeTransaction, estimateTransaction } from '@stacks/transactions';
import SelectFeeRate, { FeeRates } from '@ui-components/selectFeeRate';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import StxAmountSelector from '../stxAmountSelector';

const Container = styled.div`
  flex: 1 1 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const FeeRateContainer = styled.div`
  margin-top: ${(props) => props.theme.spacing(12)}px;
  margin-bottom: ${(props) => props.theme.spacing(8)}px;
`;

const Buttons = styled.div`
  margin: ${(props) => props.theme.spacing(12)}px 0;
`;

type Props = {
  amount: string;
  setAmount: (amount: string) => void;
  feeRate: string;
  setFeeRate: (feeRate: string) => void;
  sendMax: boolean;
  setSendMax: (sendMax: boolean) => void;
  fee: string | undefined;
  getFeeForFeeRate: (feeRate: number, useEffectiveFeeRate?: boolean) => Promise<number | undefined>;
  onNext: () => void;
  dustFiltered: boolean;
  setIsLoading: (isLoading: boolean) => void;
  isLoading?: boolean;
  header?: React.ReactNode;
  recipientAddress: string;
  memo: string;
  unsignedSendStxTx: string;
  setUnsignedSendStxTx: (unsignedSendStxTx: string) => void;
};

function Step2SelectAmount({
  recipientAddress,
  memo,
  amount,
  setAmount,
  feeRate,
  setFeeRate,
  sendMax,
  setSendMax,
  fee,
  getFeeForFeeRate,
  onNext,
  setIsLoading,
  isLoading,
  dustFiltered,
  header,
  unsignedSendStxTx,
  setUnsignedSendStxTx,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();

  const { btcFiatRate, stxBtcRate, fiatCurrency, stxBalance, stxPublicKey, feeMultipliers } =
    useWalletSelector();

  const stxToFiat = (stx: string) =>
    getStxFiatEquivalent(
      stxToMicrostacks(new BigNumber(stx)),
      new BigNumber(stxBtcRate),
      new BigNumber(btcFiatRate),
    )
      .toNumber()
      .toFixed(2);

  const hasStx = +stxBalance > 0;

  const hasSufficientFunds = new BigNumber(stxBalance).isGreaterThanOrEqualTo(
    new BigNumber(amount).plus(stxToMicrostacks(new BigNumber(fee ?? 0))),
  );

  useEffect(() => {
    if (sendMax) {
      const newAmount = new BigNumber(stxBalance).minus(stxToMicrostacks(new BigNumber(fee ?? 0)));

      if (newAmount.isGreaterThan(new BigNumber(0))) {
        setAmount(newAmount.toString());
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendMax, fee]);

  const { data: stxPendingTxData } = useStxPendingTxData();
  const selectedNetwork = useNetworkSelector();

  const [fees, setFees] = useState<FeeRates>({});

  // Reactively construct a tx
  useEffect(() => {
    setIsLoading(true);

    const createTx = async () => {
      const rawUnsignedSendStxTx: StacksTransaction =
        await generateUnsignedStxTokenTransferTransaction(
          recipientAddress,
          amount,
          memo,
          stxPendingTxData?.pendingTransactions ?? [],
          stxPublicKey,
          selectedNetwork,
        );

      // This function directly modifies unsignedSendStxTx lol
      applyFeeMultiplier(rawUnsignedSendStxTx, feeMultipliers);
      setUnsignedSendStxTx(buf2hex(rawUnsignedSendStxTx.serialize()));
      setIsLoading(false);
    };

    createTx();
  }, [
    amount,
    feeMultipliers,
    memo,
    recipientAddress,
    selectedNetwork,
    setIsLoading,
    setUnsignedSendStxTx,
    stxPendingTxData?.pendingTransactions,
    stxPublicKey,
  ]);

  // Reactively estimate fees
  useEffect(() => {
    const fetchStxFees = async () => {
      // const txRaw: string = await getRawTransaction(transaction.txid, network);

      const unsignedTx: StacksTransaction = deserializeTransaction(unsignedSendStxTx);

      const [low, medium, high] = await estimateTransaction(
        unsignedTx.payload,
        undefined,
        selectedNetwork,
      );
      setFees({
        low: Number(microstacksToStx(new BigNumber(low.fee)).toFixed(2)),
        medium: Number(microstacksToStx(new BigNumber(medium.fee)).toFixed(2)),
        high: Number(microstacksToStx(new BigNumber(high.fee)).toFixed(2)),
      });
      if (!fee)
        setFeeRate(Number(microstacksToStx(new BigNumber(medium.fee)).toFixed(2)).toString());
    };

    fetchStxFees();
  }, [selectedNetwork, unsignedSendStxTx]);

  return (
    <Container>
      <div>
        {header}
        <StxAmountSelector
          amount={amount}
          setAmount={setAmount}
          sendMax={sendMax}
          setSendMax={setSendMax}
          disabled={!hasStx}
        />
        {hasStx && (
          <FeeRateContainer>
            <SelectFeeRate
              fee={fee}
              feeUnits="STX"
              feeRate={feeRate}
              setFeeRate={setFeeRate}
              baseToFiat={stxToFiat}
              fiatUnit={fiatCurrency}
              getFeeForFeeRate={getFeeForFeeRate}
              feeRates={fees}
              feeRateLimits={{ min: 0.000001, max: feeMultipliers?.thresholdHighStacksFee }}
              isLoading={isLoading}
              absoluteBalance={Number(microstacksToStx(new BigNumber(stxBalance)))}
            />
          </FeeRateContainer>
        )}
        {sendMax && dustFiltered && <Callout bodyText={t('BTC.MAX_IGNORING_DUST_UTXO_MSG')} />}
      </div>
      <Buttons>
        {hasStx && (
          <Button
            title={hasSufficientFunds ? t('NEXT') : t('INSUFFICIENT_FUNDS')}
            onClick={onNext}
            loading={isLoading}
            disabled={!hasSufficientFunds || +amount === 0}
            variant={hasSufficientFunds ? undefined : 'danger'}
          />
        )}
        {!hasStx && (
          <Callout
            titleText={t('BTC.NO_FUNDS_TITLE')}
            bodyText={t('BTC.NO_FUNDS')}
            redirectText={t('STX.BUY_STX')}
            onClickRedirect={() => {
              navigate('/buy/STX');
            }}
          />
        )}
      </Buttons>
    </Container>
  );
}

export default Step2SelectAmount;
