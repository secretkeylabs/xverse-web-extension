import TokenImage from '@components/tokenImage';
import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import { microstacksToStx, stxToMicrostacks } from '@secretkeylabs/xverse-core';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import SendLayout from 'app/layouts/sendLayout';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Step, getNextStep, getPreviousStep } from './stepResolver';
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
  const isInOption = isInOptions();
  const navigate = useNavigate();
  const { t } = useTranslation('translation');

  useResetUserFlow('/send-stx');

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

  // Shared states
  const [isLoading, setIsLoading] = useState(false);

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
  const [amount, setAmount] = useState(
    (amountToSend &&
      (fungibleToken ? amountToSend : stxToMicrostacks(new BigNumber(amountToSend)).toString())) ??
      '',
  );
  const [sendMax, setSendMax] = useState(false);
  const [feeRate, setFeeRate] = useState(
    previousFee ? microstacksToStx(new BigNumber(previousFee)).toString() : '',
  );
  const [unsignedSendStxTx, setUnsignedSendStxTx] = useState('');

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
              onNext={() => {
                setIsLoading(false);
                setCurrentStep(getNextStep(Step.SelectRecipient, true));
              }}
              isLoading={isLoading}
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
              setFeeRate={setFeeRate}
              sendMax={sendMax}
              setSendMax={setSendMax}
              fee={feeRate}
              getFeeForFeeRate={(fee) => Promise.resolve(fee)}
              dustFiltered={false}
              onNext={() => setCurrentStep(getNextStep(Step.SelectAmount, true))}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              unsignedSendStxTx={unsignedSendStxTx}
              setUnsignedSendStxTx={setUnsignedSendStxTx}
              recipientAddress={recipientAddress}
              memo={memo}
              fungibleToken={fungibleToken}
            />
          </Container>
        </SendLayout>
      );
    case Step.Confirm:
      return (
        <Step3Confirm
          unsignedSendStxTx={unsignedSendStxTx}
          fee={feeRate}
          ftConfirmParams={
            fungibleToken
              ? {
                  unsignedTx: unsignedSendStxTx,
                  amount,
                  fungibleToken,
                  memo,
                  recipientAddress,
                  selectedFee: stxToMicrostacks(new BigNumber(feeRate)).toString(),
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
