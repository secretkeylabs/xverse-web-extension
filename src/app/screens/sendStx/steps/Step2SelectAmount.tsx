import useCoinRates from '@hooks/queries/useCoinRates';
import useStxPendingTxData from '@hooks/queries/useStxPendingTxData';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useNetworkSelector from '@hooks/useNetwork';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  buf2hex,
  generateUnsignedStxTokenTransferTransaction,
  generateUnsignedTransaction,
  getStxFiatEquivalent,
  microstacksToStx,
  stxToMicrostacks,
  type FungibleToken,
  type StacksTransaction,
} from '@secretkeylabs/xverse-core';
import { deserializeTransaction, estimateTransaction } from '@stacks/transactions';
import SelectFeeRate, { type FeeRates } from '@ui-components/selectFeeRate';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import { convertAmountToFtDecimalPlaces } from '@utils/helper';
import { getFtBalance } from '@utils/tokens';
import { modifyRecommendedStxFees } from '@utils/transactions/transactions';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import FtAmountSelector from '../ftAmountSelector';
import StxAmountSelector from '../stxAmountSelector';

const Container = styled.div`
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const FeeRateContainer = styled.div`
  margin-top: ${(props) => props.theme.space.l};
  margin-bottom: ${(props) => props.theme.space.m};
`;

const Buttons = styled.div`
  margin: ${(props) => props.theme.space.l} 0;
`;

type Props = {
  amount: string;
  setAmount: (amount: string) => void;
  setFeeRate: (feeRate: string) => void;
  sendMax: boolean;
  setSendMax: (sendMax: boolean) => void;
  fee: string;
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
  fungibleToken?: FungibleToken;
};

function Step2SelectAmount({
  recipientAddress,
  memo,
  amount,
  setAmount,
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
  fungibleToken,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();

  const { stxAddress, stxPublicKey } = useSelectedAccount();
  const { fiatCurrency, feeMultipliers } = useWalletSelector();
  const { data: stxData } = useStxWalletData();
  const { btcFiatRate, stxBtcRate } = useCoinRates();
  const stxBalance = stxData?.availableBalance.toString() ?? '0';
  const ftBalance = fungibleToken ? getFtBalance(fungibleToken) : '0';

  const stxToFiat = (stx: string) =>
    getStxFiatEquivalent(
      stxToMicrostacks(new BigNumber(stx)),
      new BigNumber(stxBtcRate),
      new BigNumber(btcFiatRate),
    ).toString();

  const hasStx = +stxBalance > 0;

  let hasInsufficientFunds =
    amount &&
    new BigNumber(stxBalance).isLessThan(
      new BigNumber(amount).plus(stxToMicrostacks(new BigNumber(fee ?? 0))),
    );

  if (fungibleToken) {
    hasInsufficientFunds =
      amount &&
      (new BigNumber(ftBalance).isLessThan(new BigNumber(amount)) ||
        new BigNumber(stxBalance).isLessThan(stxToMicrostacks(new BigNumber(fee ?? 0))));
  }

  useEffect(() => {
    if (sendMax) {
      const newAmount = fungibleToken
        ? new BigNumber(ftBalance)
        : new BigNumber(stxBalance).minus(stxToMicrostacks(new BigNumber(fee ?? 0)));

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
    const createTx = async () => {
      try {
        setIsLoading(true);

        if (fungibleToken) {
          // Create FT transfer transaction
          let convertedAmount = amount;
          if (amount && fungibleToken.decimals) {
            convertedAmount = convertAmountToFtDecimalPlaces(
              amount,
              fungibleToken.decimals,
            ).toString();
          }

          const rawUnsignedSendFtTx: StacksTransaction = await generateUnsignedTransaction({
            amount: convertedAmount,
            senderAddress: stxAddress,
            recipientAddress,
            contractAddress: fungibleToken.principal.split('.')[0],
            contractName: fungibleToken.principal.split('.')[1],
            assetName: fungibleToken?.assetName ?? '',
            publicKey: stxPublicKey,
            network: selectedNetwork,
            pendingTxs: stxPendingTxData?.pendingTransactions ?? [],
            memo,
          });
          setUnsignedSendStxTx(buf2hex(rawUnsignedSendFtTx.serialize()));
          return;
        }

        // Create STX transfer transaction
        const rawUnsignedSendStxTx: StacksTransaction =
          await generateUnsignedStxTokenTransferTransaction(
            recipientAddress,
            amount,
            memo,
            stxPendingTxData?.pendingTransactions ?? [],
            stxPublicKey,
            selectedNetwork,
          );
        setUnsignedSendStxTx(buf2hex(rawUnsignedSendStxTx.serialize()));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
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
    fungibleToken,
    stxAddress,
  ]);

  // Reactively estimate fees
  useEffect(() => {
    const fetchStxFees = async () => {
      try {
        const unsignedTx: StacksTransaction = deserializeTransaction(unsignedSendStxTx);
        const [low, medium, high] = await estimateTransaction(
          unsignedTx.payload,
          undefined,
          selectedNetwork,
        );

        let stxFees = {
          low: low.fee,
          medium: medium.fee,
          high: high.fee,
        };

        if (feeMultipliers?.thresholdHighStacksFee) {
          stxFees = modifyRecommendedStxFees(
            stxFees,
            feeMultipliers,
            unsignedTx.payload.payloadType,
          );
        }
        setFees({
          low: Number(microstacksToStx(new BigNumber(stxFees.low))),
          medium: Number(microstacksToStx(new BigNumber(stxFees.medium))),
          high: Number(microstacksToStx(new BigNumber(stxFees.high))),
        });
        if (!fee || Number(fee) <= 0) {
          setFeeRate(Number(microstacksToStx(new BigNumber(stxFees.medium))).toString());
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (unsignedSendStxTx.length > 0) {
      fetchStxFees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetwork, unsignedSendStxTx]);

  return (
    <Container>
      <div>
        {header}
        {fungibleToken ? (
          <FtAmountSelector
            amount={amount}
            setAmount={setAmount}
            sendMax={sendMax}
            setSendMax={setSendMax}
            disabled={!hasStx}
            fungibleToken={fungibleToken}
          />
        ) : (
          <StxAmountSelector
            amount={amount}
            setAmount={setAmount}
            sendMax={sendMax}
            setSendMax={setSendMax}
            disabled={!hasStx}
          />
        )}
        {hasStx && (
          <FeeRateContainer>
            <SelectFeeRate
              fee={fee}
              feeRate={fee}
              feeUnits="STX"
              setFeeRate={setFeeRate}
              baseToFiat={stxToFiat}
              fiatUnit={fiatCurrency}
              getFeeForFeeRate={getFeeForFeeRate}
              feeRates={fees}
              feeRateLimits={{ min: 0.000001, max: feeMultipliers?.thresholdHighStacksFee }}
              isLoading={isLoading}
              absoluteBalance={Number(microstacksToStx(new BigNumber(stxBalance)))}
              amount={Number(amount)}
            />
          </FeeRateContainer>
        )}
        {sendMax && dustFiltered && <Callout bodyText={t('BTC.MAX_IGNORING_DUST_UTXO_MSG')} />}
      </div>
      <Buttons>
        {hasStx && (
          <Button
            title={hasInsufficientFunds ? t('INSUFFICIENT_FUNDS') : t('NEXT')}
            onClick={onNext}
            loading={isLoading}
            disabled={hasInsufficientFunds || +amount === 0}
            variant={hasInsufficientFunds ? 'danger' : 'primary'}
          />
        )}
        {!hasStx && (
          <Callout
            dataTestID="no-funds-message"
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
