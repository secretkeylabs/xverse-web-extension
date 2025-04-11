import Separator from '@components/separator';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useAddressBookEntries from '@hooks/useAddressBookEntries';
import { Plus } from '@phosphor-icons/react';
import { Container, Title } from '@screens/settings/index.styles';
import type { AddressBookEntry } from '@secretkeylabs/xverse-core/addressBook/types';
import Button from '@ui-library/button';
import Spinner from '@ui-library/spinner';
import RoutePaths from 'app/routes/paths';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Theme from 'theme';
import AddressBookItem from './addressBookItem';
import AddressBookPlaceholder from './addressBookPlaceholder';

const ItemsContainer = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.m,
  height: '100%',
  paddingTop: props.theme.space.xs,
  paddingBottom: props.theme.space.xs,
}));

const ControlsContainer = styled.div((props) => ({
  position: 'sticky',
  bottom: 0,
  paddingTop: props.theme.space.m,
  paddingBottom: props.theme.space.l,
  backgroundColor: props.theme.colors.elevation0,
}));

const LoaderContainer = styled.div((_) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
}));

function AddressBook() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });

  const navigate = useNavigate();
  const { entries, isLoading, addEntry, removeEntry } = useAddressBookEntries();
  const showPlaceholder = !isLoading && entries.length === 0;

  const handleUndoDeleteAddress = async (item: AddressBookEntry, successCallback: () => void) => {
    addEntry(
      { address: item.address, name: item.name },
      {
        onSuccess: successCallback,
      },
    );
  };

  const handleDeleteAddress = async (item: AddressBookEntry, successCallback: () => void) => {
    // Find the entry with matching address
    const entryToDelete = entries.find((entry) => entry.id === item.id);
    if (entryToDelete) {
      removeEntry(entryToDelete.id, {
        onSuccess: successCallback,
      });
    }
  };

  const handleBackButtonClick = () => {
    navigate(-1);
  };

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
      <ItemsContainer>
        {entries.map((item, index) => (
          <div key={item.address}>
            <AddressBookItem
              item={item}
              onDelete={handleDeleteAddress}
              onUndoDelete={handleUndoDeleteAddress}
            />
            {index !== entries.length - 1 && <Separator />}
          </div>
        ))}
      </ItemsContainer>
    );
  };

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <Title>{t('ADDRESS_BOOK.TITLE')}</Title>
        {renderBody()}
        {!showPlaceholder && (
          <ControlsContainer>
            <Button
              title={t('ADDRESS_BOOK.ADD_ADDRESS.ADD_BUTTON')}
              variant="secondary"
              onClick={() => {
                navigate(RoutePaths.AddAddress);
              }}
              icon={<Plus size={16} color={Theme.colors.white_0} />}
            />
          </ControlsContainer>
        )}
      </Container>
      <BottomTabBar tab="settings" />
    </>
  );
}

export default AddressBook;
