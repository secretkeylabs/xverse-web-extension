import type { AddressType } from '@common/types/address';
import Separator from '@components/separator';
import useAddressBookEntries from '@hooks/useAddressBookEntries';
import useGetAllAccounts from '@hooks/useGetAllAccounts';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { useTransition } from '@react-spring/web';
import AddressBookItem from '@screens/settings/addressBook/addressBookItem';
import AddressBookPlaceholder from '@screens/settings/addressBook/addressBookPlaceholder';
import type { Account } from '@secretkeylabs/xverse-core';
import Spinner from '@ui-library/spinner';
import { Tabs } from '@ui-library/tabs';
import { ANIMATION_EASING } from '@utils/constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AccountRow from './accountRow';
import {
  AnimatedContent,
  Container,
  ListContainer,
  LoaderContainer,
  Subtitle,
  TabContentContainer,
  TabsContainer,
  Title,
} from './index.styled';

export type AddressSource = 'my_accounts' | 'address_book';
type TabType = 'my_accounts' | 'address_book';

type Props = {
  setAddress: (address: string, source: AddressSource) => void;
  addressType: AddressType;
};

function SelectAddress({ setAddress, addressType }: Props) {
  const { t } = useTranslation('translation');
  const { entries: addressBookEntries, isLoading } = useAddressBookEntries();
  const allAccounts = useGetAllAccounts();
  const selectedAccount = useSelectedAccount();
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'back'>('forward');

  const getAccountAddress = (account: Account) => {
    if (addressType === 'stx') {
      return account.stxAddress;
    }

    if (addressType === 'btc_ordinals') {
      return account.btcAddresses.taproot.address;
    }

    return account.btcAddresses[selectedAccount.btcAddressType]?.address ?? '';
  };

  const filteredAddressBookEntries = addressBookEntries.filter((entry) => {
    if (addressType === 'stx') {
      return entry.chain === 'stacks';
    }

    if (addressType === 'btc_payment' || addressType === 'btc_ordinals') {
      return entry.chain === 'bitcoin';
    }

    return false;
  });

  const handleAddressSelect = (address: string, source: AddressSource) => {
    setAddress(address, source);
  };

  // Prepare tabs data
  const tabs: { label: string; value: TabType }[] = [];

  if (allAccounts.length > 1) {
    tabs.push({ label: t('SELECT_ADDRESS.MY_ACCOUNTS'), value: 'my_accounts' });
  }

  if (filteredAddressBookEntries.length > 0) {
    tabs.push({ label: t('SELECT_ADDRESS.ADDRESS_BOOK'), value: 'address_book' });
  }

  const showPlaceholder = !isLoading && tabs.length === 0;

  const [activeTab, setActiveTab] = useState<TabType>('my_accounts');

  const handleTabChange = (newTab: TabType) => {
    // Set direction based on tab index change
    const oldIndex = tabs.findIndex((tab) => tab.value === activeTab);
    const newIndex = tabs.findIndex((tab) => tab.value === newTab);

    if (newIndex > oldIndex) {
      setTransitionDirection('forward');
    } else {
      setTransitionDirection('back');
    }

    setActiveTab(newTab);
  };

  const tabTransition = useTransition(activeTab, {
    from: () => ({
      opacity: 0,
      transform: `translateX(${transitionDirection === 'forward' ? '80px' : '-80px'})`,
    }),
    enter: {
      opacity: 1,
      transform: 'translateX(0px)',
    },
    leave: () => ({
      opacity: 0,
      transform: `translateX(${transitionDirection === 'forward' ? '-80px' : '80px'})`,
    }),
    config: { duration: 125, easing: ANIMATION_EASING },
    exitBeforeEnter: true,
  });

  const renderBody = () => {
    if (isLoading) {
      return (
        <LoaderContainer>
          <Spinner color="white" size={30} />
        </LoaderContainer>
      );
    }

    if (showPlaceholder) {
      return <AddressBookPlaceholder />;
    }

    return (
      <>
        <TabsContainer>
          {tabs.length > 1 && (
            <Tabs tabs={tabs} activeTab={activeTab} onTabClick={handleTabChange} />
          )}
          {tabs.length === 1 && (
            <Subtitle>
              {allAccounts.length > 1 && t('SELECT_ADDRESS.MY_ACCOUNTS')}
              {filteredAddressBookEntries.length >= 1 && t('SELECT_ADDRESS.ADDRESS_BOOK')}
            </Subtitle>
          )}
        </TabsContainer>

        <TabContentContainer>
          {tabTransition((styles, currentTab) => (
            <AnimatedContent style={styles}>
              {currentTab === 'my_accounts' ? (
                <ListContainer>
                  {allAccounts.map((account, index) => (
                    <div key={`${account.accountType}:${account.masterPubKey}:${account.id}`}>
                      <AccountRow
                        account={account}
                        address={getAccountAddress(account)}
                        onSelect={(address) => handleAddressSelect(address, 'my_accounts')}
                      />
                      {index !== allAccounts.length - 1 && <Separator />}
                    </div>
                  ))}
                </ListContainer>
              ) : (
                <ListContainer>
                  {filteredAddressBookEntries.map((item, index) => (
                    <div key={item.address}>
                      <AddressBookItem
                        item={item}
                        isViewOnly
                        onSelect={(address) => handleAddressSelect(address, 'address_book')}
                      />
                      {index !== filteredAddressBookEntries.length - 1 && <Separator />}
                    </div>
                  ))}
                </ListContainer>
              )}
            </AnimatedContent>
          ))}
        </TabContentContainer>
      </>
    );
  };

  return (
    <Container>
      <Title>{t('SELECT_ADDRESS.TITLE')}</Title>
      {renderBody()}
    </Container>
  );
}

export default SelectAddress;
