import type { AddressType } from '@common/types/address';
import type { AddressSource } from '@components/selectAddress';
import SelectAddress from '@components/selectAddress';
import AccountRow from '@components/selectAddress/accountRow';
import { useBnsName, useBnsResolver } from '@hooks/queries/useBnsName';
import useAddressBookEntries from '@hooks/useAddressBookEntries';
import useGetAllAccounts from '@hooks/useGetAllAccounts';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { At, Plus } from '@phosphor-icons/react';
import { StyledCallout } from '@screens/createInscription/index.styled';
import AddressBookItem from '@screens/settings/addressBook/addressBookItem';
import { validateBtcAddress } from '@secretkeylabs/xverse-core';
import { validateStacksAddress } from '@stacks/transactions';
import Button from '@ui-library/button';
import Input from '@ui-library/input';
import { InputFeedback, type InputFeedbackProps } from '@ui-library/inputFeedback';
import Sheet from '@ui-library/sheet';
import { type TabType } from '@utils/helper';
import SendLayout from 'app/layouts/sendLayout';
import RoutePaths, { RoutePathsSuffixes } from 'app/routes/paths';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Theme from 'theme';
import {
  Buttons,
  Container,
  Feedback,
  HeaderButton,
  HeaderContainer,
  HeaderTitle,
  SaveAddressButton,
  SaveAddressContainer,
} from './index.styled';
import SelectedRecipient from './selectedRecipient';

type Props = {
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  recipientError?: InputFeedbackProps | null;
  onNext: () => void;
  isLoading: boolean;
  calloutText?: string;
  insufficientFunds?: boolean;
  customFields?: ReactNode;
  recipientPlaceholder?: string;
  onBack: () => void;
  selectedBottomTab?: TabType;
  addressType: AddressType;
};

function RecipientSelector({
  recipientAddress,
  setRecipientAddress,
  recipientError,
  onNext,
  isLoading,
  calloutText,
  insufficientFunds,
  customFields,
  recipientPlaceholder,
  onBack,
  selectedBottomTab = 'dashboard',
  addressType,
}: Props) {
  /* state */
  const [addressIsValid, setAddressIsValid] = useState(true);
  const [toOwnAddress, setToOwnAddress] = useState(false);
  const [displayInsufficientFunds, setDisplayInsufficientFunds] = useState(false);
  const [newRecipientAddress, setNewRecipientAddress] = useState(recipientAddress);
  const [showSaveAddressSheet, setShowSaveAddressSheet] = useState(false);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [addressSource, setAddressSource] = useState<AddressSource | null>(null);
  const [name, setName] = useState('');

  /* hooks */
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'COMMON' });

  const { network } = useWalletSelector();
  const selectedAccount = useSelectedAccount();
  const { entries: addressBook, addEntry, isAddingEntry: isSaving } = useAddressBookEntries();
  const allAccounts = useGetAllAccounts();
  const location = useLocation();

  /* BNS */
  let currencyType: 'BTC' | 'STX' | undefined;
  if (location.pathname.includes(RoutePaths.SendBtc)) {
    currencyType = 'BTC';
  }
  if (
    location.pathname.includes(RoutePaths.SendStx) ||
    location.pathname.includes(RoutePathsSuffixes.SendNft)
  ) {
    currencyType = 'STX';
  }
  const { data: associatedAddress } = useBnsResolver(
    newRecipientAddress,
    selectedAccount.stxAddress,
    currencyType,
  );
  const { data: associatedBnsName } = useBnsName(newRecipientAddress);

  // Handle back button click
  const handleBackClick = () => {
    if (showAddressSelector) {
      // If address selector is visible, hide it instead of navigating back
      setShowAddressSelector(false);
    } else {
      // Otherwise, perform the normal back action
      onBack();
    }
  };

  const handleNext = () => {
    if (insufficientFunds) {
      setDisplayInsufficientFunds(true);
      return;
    }

    const targetAddress = associatedAddress || recipientAddress;

    // Validate address based on address type
    let isValid = false;
    if (addressType === 'stx') {
      isValid = validateStacksAddress(targetAddress);
    } else {
      isValid = validateBtcAddress({ btcAddress: targetAddress, network: network.type });
    }

    if (!isValid) {
      setAddressIsValid(false);
      return;
    }
    onNext();
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(e.target.value);
    setNewRecipientAddress(e.target.value);
    setToOwnAddress(
      [
        selectedAccount.btcAddress,
        selectedAccount.ordinalsAddress,
        selectedAccount.stxAddress,
      ].includes(e.target.value),
    );
    setAddressIsValid(true);
    setDisplayInsufficientFunds(false);
    setAddressSource(null);
  };

  const handleSaveAddress = async () => {
    if (!name || !newRecipientAddress) {
      return;
    }

    addEntry(
      { address: newRecipientAddress, name },
      {
        onSuccess: () => {
          setShowSaveAddressSheet(false);
          toast(t('ADDRESS_ADDED'));
        },
      },
    );
  };

  const handleAddressSelect = (address: string, source: AddressSource) => {
    setRecipientAddress(address);
    setNewRecipientAddress(address);
    setShowAddressSelector(false);
    setAddressSource(source);
    setToOwnAddress(
      [
        selectedAccount.btcAddress,
        selectedAccount.ordinalsAddress,
        selectedAccount.stxAddress,
      ].includes(address),
    );
    setAddressIsValid(true);
    setDisplayInsufficientFunds(false);
  };

  const accountListItem =
    recipientAddress &&
    allAccounts.find(
      (item) =>
        item.btcAddresses.taproot.address === recipientAddress ||
        item.btcAddresses[selectedAccount.btcAddressType]?.address === recipientAddress ||
        item.stxAddress === recipientAddress,
    );
  const addressBookItem =
    recipientAddress && addressBook.find((item) => item.address === recipientAddress);

  const inputFeedback = useMemo(() => {
    if (recipientError) {
      return [recipientError];
    }
    if (displayInsufficientFunds) {
      return [
        {
          variant: 'danger' as const,
          message: t('ERRORS.INSUFFICIENT_BALANCE_FEES'),
        },
      ];
    }
    if (!addressIsValid) {
      return [
        {
          variant: 'danger' as const,
          message: t('ERRORS.ADDRESS_INVALID'),
        },
      ];
    }
    if (toOwnAddress) {
      if (addressType === 'stx') {
        return [
          {
            variant: 'danger' as const,
            message: t('ERRORS.SEND_TO_SELF'),
          },
        ];
      }
      return [
        {
          variant: 'info' as const,
          message: t('YOU_ARE_TRANSFERRING_TO_YOURSELF'),
        },
      ];
    }
    if (recipientAddress && !addressBookItem && !accountListItem) {
      if (associatedBnsName) {
        return [
          { variant: 'checkmark' as const, message: t('ASSOCIATED_DOMAIN') },
          { variant: 'plainIndented' as const, message: associatedBnsName },
        ];
      }
      if (associatedAddress) {
        return [
          { variant: 'checkmark' as const, message: t('ASSOCIATED_ADDRESS') },
          { variant: 'plainIndented' as const, message: associatedAddress },
        ];
      }
    }
    return undefined;
  }, [
    addressIsValid,
    displayInsufficientFunds,
    toOwnAddress,
    recipientError,
    associatedAddress,
    associatedBnsName,
    recipientAddress,
    addressBookItem,
    accountListItem,
    addressType,
  ]);

  if (showAddressSelector) {
    return (
      <SendLayout selectedBottomTab={selectedBottomTab} onClickBack={handleBackClick}>
        <Container>
          <SelectAddress setAddress={handleAddressSelect} addressType={addressType} />
        </Container>
      </SendLayout>
    );
  }

  return (
    <SendLayout selectedBottomTab={selectedBottomTab} onClickBack={handleBackClick}>
      <Container>
        <div>
          <HeaderContainer>
            <HeaderTitle>{t('SEND_TO')}</HeaderTitle>
            <HeaderButton
              title={t('ADDRESS_BOOK')}
              variant="secondary"
              onClick={() => setShowAddressSelector(true)}
              icon={<At size={16} weight="bold" color={Theme.colors.white_0} />}
            />
          </HeaderContainer>
          {accountListItem && (!addressSource || addressSource === 'my_accounts') ? (
            <SelectedRecipient setRecipientAddress={setRecipientAddress}>
              <AccountRow account={accountListItem} addressType={addressType} />
            </SelectedRecipient>
          ) : addressBookItem && (!addressSource || addressSource === 'address_book') ? (
            <SelectedRecipient setRecipientAddress={setRecipientAddress}>
              <AddressBookItem item={addressBookItem} isViewOnly />
            </SelectedRecipient>
          ) : (
            <Input
              dataTestID="address-receive"
              title={t('RECIPIENT')}
              placeholder={recipientPlaceholder || t('BTC.RECIPIENT_PLACEHOLDER')}
              value={recipientAddress}
              onChange={handleAddressChange}
              variant={addressIsValid ? 'default' : 'danger'}
              feedback={inputFeedback}
              autoFocus
            />
          )}
          {accountListItem && inputFeedback && inputFeedback.length > 0 && (
            // We still show the InputFeedback component even if the Input component is not visible
            // to show the address validation errors
            <Feedback>
              {inputFeedback.map((feedback) => (
                <InputFeedback key={feedback.message} {...feedback} />
              ))}
            </Feedback>
          )}
          {recipientAddress &&
            !addressBookItem &&
            !accountListItem &&
            !associatedAddress &&
            !associatedBnsName && (
              <SaveAddressButton
                title={t('SAVE_TO_ADDRESS_BOOK')}
                variant="secondary"
                onClick={() => setShowSaveAddressSheet(true)}
                icon={<Plus size={16} color={Theme.colors.white_0} />}
              />
            )}

          {/* Render custom fields if provided */}
          {customFields}
        </div>
        {calloutText && <StyledCallout bodyText={calloutText} />}
        <Buttons>
          <Button
            title={t('NEXT')}
            onClick={handleNext}
            disabled={
              !recipientAddress || inputFeedback?.some((feedback) => feedback.variant === 'danger')
            }
            loading={isLoading}
          />
        </Buttons>

        <Sheet
          visible={showSaveAddressSheet}
          title={t('SAVE_ADDRESS')}
          onClose={() => setShowSaveAddressSheet(false)}
        >
          <SaveAddressContainer>
            <Input
              title={t('NAME')}
              placeholder={t('NAME_PLACEHOLDER')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <Input
              title={t('RECIPIENT')}
              placeholder={recipientPlaceholder || t('BTC.RECIPIENT_PLACEHOLDER')}
              value={newRecipientAddress}
              onChange={(e) => setNewRecipientAddress(e.target.value)}
            />
            <Button
              title={tCommon('SAVE')}
              onClick={handleSaveAddress}
              disabled={!name || !newRecipientAddress || isSaving}
              loading={isSaving}
            />
          </SaveAddressContainer>
        </Sheet>
      </Container>
    </SendLayout>
  );
}

export default RecipientSelector;
