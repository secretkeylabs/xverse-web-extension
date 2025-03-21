import TokenImage from '@components/tokenImage';
import useXverseApi from '@hooks/apiClients/useXverseApi';
import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useStxPendingTxData from '@hooks/queries/useStxPendingTxData';
import useCancellableEffect from '@hooks/useCancellableEffect';
import useDebounce from '@hooks/useDebounce';
import useNetworkSelector from '@hooks/useNetwork';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  estimateStacksTransactionWithFallback,
  generateUnsignedSip10TransferTransaction,
  generateUnsignedTx,
  microstacksToStx,
  nextBestNonce,
  stxToMicrostacks,
} from '@secretkeylabs/xverse-core';
import { TransactionTypes } from '@stacks/connect';
import { deserializeTransaction, StacksTransactionWire } from '@stacks/transactions';
import type { FeeRates } from '@ui-components/selectFeeRate';
import { convertAmountToFtDecimalPlaces } from '@utils/helper';
import SendLayout from 'app/layouts/sendLayout';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { getNextStep, getPreviousStep, Step } from './stepResolver';
import Step1SelectRecipientAndMemo from './steps/Step1SelectRecipient';
import Step2SelectAmount from './steps/Step2SelectAmount';
import Step3Confirm from './steps/Step3Confirm';

const Container = styled.div`
  display: flex;
  flex: 1 1 100%;
  min-height: 370px;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0;
`;

const Title = styled.div`
  ${(props) => props.theme.typography.headline_xs}
  margin-top: ${(props) => props.theme.space.s};
  margin-bottom: ${(props) => props.theme.space.l};
`;

function SendStxScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation('translation');

  useResetUserFlow('/send-stx');

  const xverseApiClient = useXverseApi();

  const location = useLocation();
  const {
    recipientAddress: stateAddress,
    amountToSend,
    stxMemo,
    fee: previousFee,
  } = location.state || {};

  const [currentStep, setCurrentStep] = useState<Step>(
    stateAddress ? Step.SelectAmount : Step.SelectRecipient,
  );

  // required stx hooks/states for tx construction
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const { stxAddress, stxPublicKey } = useSelectedAccount();
  const selectedNetwork = useNetworkSelector();
  const { feeMultipliers } = useWalletSelector();
  const { data: stxPendingTxData } = useStxPendingTxData();
  const [feeRates, setFeeRates] = useState<FeeRates>({});
  const [unsignedSendStxTx, setUnsignedSendStxTx] = useState('');

  // Step 1 states
  const [recipientAddress, setRecipientAddress] = useState(stateAddress ?? '');
  // Will be used in the future when the summary screen is refactored
  const [, setRecipientDomain] = useState('');
  const [memo, setMemo] = useState(stxMemo ?? '');
  const { data: sip10CoinsList } = useVisibleSip10FungibleTokens();
  const [searchParams] = useSearchParams();
  const principal = searchParams.get('principal');
  const fungibleToken = sip10CoinsList?.find((coin) => coin.principal === principal);

  // Step 2 states
  const [amount, setAmount] = useState(() => {
    if (!amountToSend) return '0';

    try {
      const value = fungibleToken
        ? amountToSend
        : stxToMicrostacks(new BigNumber(amountToSend)).toString();
      return value || '0';
    } catch (e) {
      return '0';
    }
  });
  const [sendMax, setSendMax] = useState(false);
  const [fee, setFee] = useState(
    previousFee ? microstacksToStx(new BigNumber(previousFee)).toString() : '',
  );

  // Debounced values
  const debouncedRecipient = useDebounce(recipientAddress, 300);
  const debouncedAmount = useDebounce(amount, 300, true);

  const handleCancel = () => {
    if (fungibleToken) {
      navigate(
        `/coinDashboard/FT?ftKey=${fungibleToken.principal}&protocol=${fungibleToken.protocol}`,
      );
    } else {
      navigate(`/coinDashboard/STX`);
    }
  };

  const handleBackButtonClick = () => {
    if (currentStep > 0) {
      setCurrentStep(getPreviousStep(currentStep, true));
    } else {
      handleCancel();
    }
  };

  useCancellableEffect(
    async (isEffectActive) => {
      try {
        setIsLoadingTx(true);
        if (fungibleToken) {
          let convertedAmount = debouncedAmount;
          if (debouncedAmount && fungibleToken.decimals) {
            convertedAmount = convertAmountToFtDecimalPlaces(
              debouncedAmount,
              fungibleToken.decimals,
            ).toString();
          }
          const rawUnsignedSendFtTx = await generateUnsignedSip10TransferTransaction({
            amount: convertedAmount,
            senderAddress: stxAddress,
            recipientAddress: debouncedRecipient,
            contractAddress: fungibleToken.principal.split('.')[0],
            contractName: fungibleToken.principal.split('.')[1],
            assetName: fungibleToken?.assetName ?? '',
            publicKey: stxPublicKey,
            network: selectedNetwork,
            memo,
            xverseApiClient,
          });

          if (isEffectActive()) {
            setUnsignedSendStxTx(rawUnsignedSendFtTx.serialize());
          }
          return;
        }
        const nonce = await nextBestNonce(stxAddress, selectedNetwork);
        const feeInMicrostacks = fee ? stxToMicrostacks(new BigNumber(fee)).toString() : '0';

        const rawUnsignedSendStxTx = await generateUnsignedTx({
          publicKey: stxPublicKey,
          payload: {
            txType: TransactionTypes.STXTransfer,
            recipient: debouncedRecipient,
            memo,
            amount: debouncedAmount,
            network: selectedNetwork,
            publicKey: stxPublicKey,
          },
          fee: feeInMicrostacks,
          nonce,
          xverseApiClient,
        });
        if (isEffectActive()) {
          setUnsignedSendStxTx(rawUnsignedSendStxTx.serialize());
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isEffectActive()) setIsLoadingTx(false);
      }
    },
    [
      debouncedRecipient,
      debouncedAmount,
      memo,
      stxPendingTxData?.pendingTransactions,
      stxPublicKey,
      stxAddress,
      selectedNetwork,
      setIsLoadingTx,
      setUnsignedSendStxTx,
      fungibleToken,
      fee,
    ],
  );

  // TODO: feeRates dont change much in the context of STX transfers so we only need to run this once
  useEffect(() => {
    const fetchStxFees = async () => {
      try {
        if (unsignedSendStxTx.length === 0) {
          return;
        }

        const unsignedTx: StacksTransactionWire = deserializeTransaction(unsignedSendStxTx);
        const [low, medium, high] = await estimateStacksTransactionWithFallback(
          unsignedTx,
          selectedNetwork,
        );

        const stxFees = {
          low: low.fee,
          medium: medium.fee,
          high: high.fee,
        };

        setFeeRates({
          low: Number(microstacksToStx(new BigNumber(stxFees.low))),
          medium: Number(microstacksToStx(new BigNumber(stxFees.medium))),
          high: Number(microstacksToStx(new BigNumber(stxFees.high))),
        });

        if (!fee || Number(fee) <= 0) {
          setFee(Number(microstacksToStx(new BigNumber(stxFees.medium))).toString());
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (unsignedSendStxTx.length > 0) {
      fetchStxFees();
    }
  }, [fee, feeMultipliers, selectedNetwork, unsignedSendStxTx]);

  const header = (
    <TitleContainer>
      <TokenImage currency={fungibleToken ? 'FT' : 'STX'} fungibleToken={fungibleToken} />
      <Title>{t('SEND.SEND')}</Title>
    </TitleContainer>
  );

  switch (currentStep) {
    case Step.SelectRecipient:
      return (
        <SendLayout selectedBottomTab="dashboard" onClickBack={handleBackButtonClick}>
          <Container>
            <Step1SelectRecipientAndMemo
              dataTestID="address-receive"
              header={header}
              recipientAddress={recipientAddress}
              setRecipientAddress={setRecipientAddress}
              setRecipientDomain={setRecipientDomain}
              memo={memo}
              setMemo={setMemo}
              onNext={() => setCurrentStep(getNextStep(Step.SelectRecipient, true))}
              isLoading={isLoadingTx || recipientAddress !== debouncedRecipient}
            />
          </Container>
        </SendLayout>
      );
    case Step.SelectAmount:
      return (
        <SendLayout selectedBottomTab="dashboard" onClickBack={handleBackButtonClick}>
          <Container>
            <Step2SelectAmount
              header={header}
              amount={amount}
              setAmount={setAmount}
              fee={fee}
              setFee={setFee}
              sendMax={sendMax}
              setSendMax={setSendMax}
              feeRates={feeRates}
              getFeeForFeeRate={(feeRate) => Promise.resolve(feeRate)}
              dustFiltered={false}
              onNext={() => setCurrentStep(getNextStep(Step.SelectAmount, true))}
              isLoading={isLoadingTx || amount !== debouncedAmount}
              fungibleToken={fungibleToken}
            />
          </Container>
        </SendLayout>
      );
    case Step.Confirm:
      return (
        <Step3Confirm
          unsignedSendStxTx={unsignedSendStxTx}
          fee={fee}
          ftConfirmParams={
            fungibleToken
              ? {
                  unsignedTx: unsignedSendStxTx,
                  amount: debouncedAmount,
                  fungibleToken,
                  memo,
                  recipientAddress: debouncedRecipient,
                  selectedFee: stxToMicrostacks(new BigNumber(fee)).toString(),
                }
              : undefined
          }
        />
      );
    default:
      throw new Error(`Unknown step: ${currentStep}`);
  }
}

export default SendStxScreen;
