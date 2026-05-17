import useBnrpNameResolution, { isBnrpName } from '@hooks/useBnrpNameResolution';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { StyledCallout } from '@screens/createInscription/index.styled';
import { validateBtcAddress } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Input from '@ui-library/input';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Buttons = styled.div`
  margin: ${(props) => props.theme.spacing(12)}px 0;
`;

const ResolvedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: #888;
  font-family: monospace;
  word-break: break-all;
`;

const ResolvedDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
`;

type Props = {
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  onNext: () => void;
  isLoading: boolean;
  header?: React.ReactNode;
  calloutText?: string;
  insufficientFunds?: boolean;
};

function RecipientSelector({
  recipientAddress,
  setRecipientAddress,
  onNext,
  isLoading,
  header,
  calloutText,
  insufficientFunds,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { network } = useWalletSelector();
  const [addressIsValid, setAddressIsValid] = useState(true);
  const [toOwnAddress, setToOwnAddress] = useState(false);
  const [displayInsufficientFunds, setDisplayInsufficientFunds] = useState(false);
  const selectedAccount = useSelectedAccount();
  const { resolution, resolve, reset } = useBnrpNameResolution();
  const isResolvingName = resolution.status === 'resolving';

  const handleNext = async () => {
    if (insufficientFunds) {
      setDisplayInsufficientFunds(true);
      return;
    }

    // If input looks like a Bitcoin name, resolve it first
    if (isBnrpName(recipientAddress)) {
      const resolved = await resolve(recipientAddress);
      if (resolved) {
        setRecipientAddress(resolved);
        onNext();
      }
      // error state is shown via inputFeedback
      return;
    }

    if (!validateBtcAddress({ btcAddress: recipientAddress, network: network.type })) {
      setAddressIsValid(false);
      return;
    }
    onNext();
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(e.target.value);
    reset();
    setToOwnAddress(
      [selectedAccount.btcAddress, selectedAccount.ordinalsAddress].includes(e.target.value),
    );
    setAddressIsValid(true);
    setDisplayInsufficientFunds(false);
  };

  const inputFeedback = useMemo(() => {
    if (displayInsufficientFunds) {
      return [{ variant: 'danger' as const, message: t('ERRORS.INSUFFICIENT_BALANCE_FEES') }];
    }
    if (!addressIsValid) {
      return [{ variant: 'danger' as const, message: t('ERRORS.ADDRESS_INVALID') }];
    }
    if (resolution.status === 'error') {
      return [{ variant: 'danger' as const, message: resolution.message }];
    }
    if (resolution.status === 'resolving') {
      return [{ variant: 'info' as const, message: `Resolving ${recipientAddress}...` }];
    }
    if (toOwnAddress) {
      return [{ variant: 'info' as const, message: t('YOU_ARE_TRANSFERRING_TO_YOURSELF') }];
    }
  }, [addressIsValid, displayInsufficientFunds, resolution, recipientAddress, toOwnAddress, t]);

  return (
    <Container>
      <div>
        {header}
        <Input
          dataTestID="address-receive"
          title={t('RECIPIENT')}
          placeholder="Address or Bitcoin name (satoshi.btc)"
          value={recipientAddress}
          onChange={handleAddressChange}
          variant={addressIsValid && resolution.status !== 'error' ? 'default' : 'danger'}
          feedback={inputFeedback}
          autoFocus
        />
        {resolution.status === 'resolved' && (
          <ResolvedBadge>
            <ResolvedDot />
            {resolution.address}
          </ResolvedBadge>
        )}
      </div>
      {calloutText && <StyledCallout bodyText={calloutText} />}
      <Buttons>
        <Button
          title={t('NEXT')}
          onClick={handleNext}
          disabled={displayInsufficientFunds || !recipientAddress || !addressIsValid || isResolvingName}
          loading={isLoading || isResolvingName}
        />
      </Buttons>
    </Container>
  );
}

export default RecipientSelector;
