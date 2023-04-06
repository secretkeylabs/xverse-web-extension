import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { animated, useTransition } from '@react-spring/web';
import Transport from '@ledgerhq/hw-transport-webusb';
import ActionButton from '@components/button';
import {
  Account,
  importNestedSegwitAccountFromLedger,
  importTaprootAccountFromLedger,
  signLedgerNestedSegwitBtcTransaction,
} from '@secretkeylabs/xverse-core';
import useWalletReducer from '@hooks/useWalletReducer';
import BigNumber from 'bignumber.js';

const Container = styled.div`
  display: flex;
  margin-left: auto;
  margin-right: auto;
  flex-direction: column;
  flex: 1;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const OnBoardingContentContainer = styled(animated.div)((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'center',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));
const OnBoardingActionsContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(30),
}));

interface Credential {
  publicKey: string;
  address: string;
}

function ConfirmLedgerBtcTransaction(): JSX.Element {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [signingResult, setSigningResult] = useState('');
  const { t } = useTranslation('translation', { keyPrefix: 'ONBOARDING_SCREEN' });
  const { addLedgerAccount } = useWalletReducer();
  const navigate = useNavigate();
  let [searchParams] = useSearchParams();

  const transition = useTransition(currentStepIndex, {
    from: {
      x: 24,
      opacity: 0,
    },
    enter: {
      x: 0,
      opacity: 1,
    },
  });

  const handleClickNext = async () => {
    const amount = searchParams.get('amount');
    const address = searchParams.get('address');
    if (!amount || !address) {
      return;
    }
    if (currentStepIndex === 0) {
      const transport = await Transport.create();

      if (searchParams.get('amount') && searchParams.get('address')) {
        const result = await signLedgerNestedSegwitBtcTransaction(transport, 'Testnet', 0, {
          address,
          amountSats: new BigNumber(parseInt(amount)),
        });

        setSigningResult(result);
      }
    }
    if (currentStepIndex === 1) {
      // Broadcast tx
    }
    setCurrentStepIndex(currentStepIndex + 1);
  };

  return (
    <Container>
      {transition((style, index) => (
        <>
          <OnBoardingContentContainer>
            {currentStepIndex === 0 ? (
              <div>Connect your device to confirm the transaction</div>
            ) : currentStepIndex === 1 ? (
              <div>{signingResult}</div>
            ) : currentStepIndex === 2 ? (
              <div>Transaction broadcasted, you can close this window</div>
            ) : null}
          </OnBoardingContentContainer>
          <OnBoardingActionsContainer>
            <ActionButton onPress={handleClickNext} text={t('ONBOARDING_NEXT_BUTTON')} />
          </OnBoardingActionsContainer>
        </>
      ))}
    </Container>
  );
}

export default ConfirmLedgerBtcTransaction;
