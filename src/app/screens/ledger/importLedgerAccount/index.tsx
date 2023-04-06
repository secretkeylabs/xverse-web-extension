import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { animated, useTransition } from '@react-spring/web';
import Transport from '@ledgerhq/hw-transport-webusb';
import ActionButton from '@components/button';
import {
  Account,
  importNestedSegwitAccountFromLedger,
  importTaprootAccountFromLedger,
} from '@secretkeylabs/xverse-core';
import useWalletReducer from '@hooks/useWalletReducer';

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

function ImportLedger(): JSX.Element {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isBitcoinSelected, setIsBitcoinSelected] = useState(true);
  const [isOrdinalsSelected, setIsOrdinalsSelected] = useState(true);
  const [bitcoinCredentials, setBitcoinCredentials] = useState<Credential | undefined>(undefined);
  const [ordinalsCredentials, setOrdinalsCredentials] = useState<Credential | undefined>(undefined);
  const { t } = useTranslation('translation', { keyPrefix: 'ONBOARDING_SCREEN' });
  const { addLedgerAccount } = useWalletReducer();
  const navigate = useNavigate();
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

  const importAccounts = async () => {
    const transport = await Transport.create();
    if (isBitcoinSelected) {
      const { address, publicKey } = await importNestedSegwitAccountFromLedger(
        transport,
        'Testnet',
        0,
        0,
        false
      );
      setBitcoinCredentials({ address, publicKey });
    }
    if (isOrdinalsSelected) {
      const { address, publicKey } = await importTaprootAccountFromLedger(
        transport,
        'Testnet',
        0,
        0,
        false
      );
      setOrdinalsCredentials({ address, publicKey });
    }
    await transport.close();
  };

  const handleClickNext = async () => {
    if (currentStepIndex === 1) {
      await importAccounts();
    }
    if (currentStepIndex === 2) {
      const ledgerAccount: Account = {
        id: 0,
        stxAddress: '',
        btcAddress: bitcoinCredentials?.address || '',
        ordinalsAddress: ordinalsCredentials?.address || '',
        masterPubKey: '',
        stxPublicKey: '',
        btcPublicKey: bitcoinCredentials?.publicKey || '',
        ordinalsPublicKey: ordinalsCredentials?.publicKey || '',
        isLedgerAccount: true,
        accountName: 'Ledger Account 1',
      };
      await addLedgerAccount(ledgerAccount);
    }
    setCurrentStepIndex(currentStepIndex + 1);
  };

  return (
    <Container>
      {transition((style, index) => (
        <>
          <OnBoardingContentContainer>
            {currentStepIndex === 0 ? (
              <div>
                Bitcoin
                <input
                  type="checkbox"
                  checked={isBitcoinSelected}
                  onChange={(e) => setIsBitcoinSelected(e.target.checked)}
                />
                Ordinals
                <input
                  type="checkbox"
                  checked={isOrdinalsSelected}
                  onChange={(e) => setIsOrdinalsSelected(e.target.checked)}
                />
              </div>
            ) : currentStepIndex === 1 ? (
              <div>Connect your device</div>
            ) : currentStepIndex === 2 ? (
              <div>
                <div>Bitcoin Address: {bitcoinCredentials?.address}</div>
                <div>Ordinals Address: {ordinalsCredentials?.address}</div>
              </div>
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

export default ImportLedger;
