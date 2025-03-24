import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useAddressBookEntries from '@hooks/useAddressBookEntries';
import { Container, Title } from '@screens/settings/index.styles';
import Button from '@ui-library/button';
import Input from '@ui-library/input';
import Spinner from '@ui-library/spinner';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

const ContentContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.m,
  paddingTop: props.theme.space.xs,
  height: '100%',
}));

const ButtonContainer = styled.div((props) => ({
  marginTop: 'auto',
  paddingBottom: props.theme.space.l,
}));

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.space.l,
}));

type Mode = 'add' | 'edit';

function AddEditAddress({ mode }: { mode: Mode }) {
  /* hooks */
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN.ADDRESS_BOOK' });
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    entries,
    isLoading: isLoadingEntries,
    addEntry,
    editEntry,
    isAddingEntry,
    isEditingEntry,
  } = useAddressBookEntries();

  /* state */
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(!!id);

  // Load the address if in edit mode
  useEffect(() => {
    if (!id || isLoadingEntries) {
      return;
    }

    const foundEntry = entries.find((entry) => entry.id === id);
    if (foundEntry) {
      setName(foundEntry.name);
      setAddress(foundEntry.address);
    } else {
      toast.error(t('EDIT_ADDRESS.ADDRESS_NOT_FOUND'));
      navigate(-1);
    }
    setIsLoading(false);
  }, [id, entries, isLoadingEntries, navigate, t]);

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleSaveAddress = () => {
    if (!name || !address) {
      return;
    }

    if (mode === 'add') {
      addEntry(
        { address, name },
        {
          onSuccess: () => {
            navigate(-1);
            toast(t('ADD_ADDRESS.ADDRESS_ADDED'));
          },
        },
      );
    } else if (mode === 'edit' && id) {
      editEntry(
        {
          id,
          data: { name, address },
        },
        {
          onSuccess: () => {
            navigate(-1);
            toast(t('EDIT_ADDRESS.CHANGES_SAVED'));
          },
        },
      );
    }
  };

  const isProcessing = mode === 'add' ? isAddingEntry : isEditingEntry;

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <Title>{mode === 'add' ? t('ADD_ADDRESS.TITLE') : t('EDIT_ADDRESS.TITLE')}</Title>
        {isLoading || isLoadingEntries ? (
          <LoaderContainer>
            <Spinner color="white" size={30} />
          </LoaderContainer>
        ) : (
          <ContentContainer>
            <Input
              title={t('ADD_ADDRESS.NAME')}
              placeholder={t('ADD_ADDRESS.NAME_PLACEHOLDER')}
              value={name}
              onChange={handleNameChange}
              autoFocus
            />
            <Input
              title={t('ADD_ADDRESS.ADDRESS')}
              placeholder={t('ADD_ADDRESS.ADDRESS_PLACEHOLDER')}
              value={address}
              onChange={handleAddressChange}
              variant="default"
            />
            <ButtonContainer>
              <Button
                title={
                  mode === 'add' ? t('ADD_ADDRESS.ADD_BUTTON') : t('EDIT_ADDRESS.SAVE_CHANGES')
                }
                onClick={handleSaveAddress}
                loading={isProcessing}
                disabled={!name || !address || isProcessing}
              />
            </ButtonContainer>
          </ContentContainer>
        )}
      </Container>
      <BottomTabBar tab="settings" />
    </>
  );
}

export default AddEditAddress;
