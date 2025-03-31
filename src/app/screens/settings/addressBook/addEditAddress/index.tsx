import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { valibotResolver } from '@hookform/resolvers/valibot';
import useAddressBookEntries from '@hooks/useAddressBookEntries';
import { Title } from '@screens/settings/index.styles';
import Button from '@ui-library/button';
import Input from '@ui-library/input';
import Spinner from '@ui-library/spinner';
import { MAX_ACC_NAME_LENGTH } from '@utils/constants';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import * as v from 'valibot';

const FormContainer = styled.form((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: `0 ${props.theme.space.xs}`,
  ...props.theme.scrollbar,
}));

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

type FormValues = {
  name: string;
  address: string;
};

const validNameCharRegex = /^[a-zA-Z0-9 ]*$/;

type Mode = 'add' | 'edit';

function AddEditAddress({ mode }: { mode: Mode }) {
  /* hooks */
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN.ADDRESS_BOOK' });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'COMMON' });
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

  const formSchema = v.object({
    name: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty(tCommon('FIELD_REQUIRED')),
      v.maxLength(
        MAX_ACC_NAME_LENGTH,
        t('ERROR.NAME_TOO_LONG', { maxLength: MAX_ACC_NAME_LENGTH }),
      ),
      v.check((name) => validNameCharRegex.test(name), t('ERROR.PROHIBITED_SYMBOLS')),
    ),
    address: v.pipe(v.string(), v.trim(), v.nonEmpty(tCommon('FIELD_REQUIRED'))),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: valibotResolver(formSchema),
  });

  const name = watch('name');
  const address = watch('address');

  /* state */
  const [isLoading, setIsLoading] = useState(!!id);

  // Load the address if in edit mode
  useEffect(() => {
    if (!id || isLoadingEntries) {
      return;
    }

    const foundEntry = entries.find((entry) => entry.id === id);
    if (foundEntry) {
      setValue('name', foundEntry.name);
      setValue('address', foundEntry.address);
    } else {
      toast.error(t('EDIT_ADDRESS.ADDRESS_NOT_FOUND'));
      navigate(-1);
    }
    setIsLoading(false);
  }, [id, entries, isLoadingEntries, navigate, t, setValue]);

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const handleSaveAddress = (data: FormValues) => {
    if (mode === 'add') {
      addEntry(data, {
        onSuccess: () => {
          navigate(-1);
          toast(t('ADD_ADDRESS.ADDRESS_ADDED'));
        },
      });
    } else if (mode === 'edit' && id) {
      editEntry(
        {
          id,
          data,
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
      <FormContainer onSubmit={handleSubmit(handleSaveAddress)}>
        <Title>{mode === 'add' ? t('ADD_ADDRESS.TITLE') : t('EDIT_ADDRESS.TITLE')}</Title>
        {isLoading || isLoadingEntries ? (
          <LoaderContainer>
            <Spinner color="white" size={30} />
          </LoaderContainer>
        ) : (
          <ContentContainer>
            <Input
              {...register('name')}
              titleElement={t('ADD_ADDRESS.NAME')}
              placeholder={t('ADD_ADDRESS.NAME_PLACEHOLDER')}
              feedback={
                errors.name?.message
                  ? [{ message: errors.name.message, variant: 'danger' }]
                  : undefined
              }
              autoFocus
            />
            <Input
              {...register('address')}
              titleElement={t('ADD_ADDRESS.ADDRESS')}
              placeholder={t('ADD_ADDRESS.ADDRESS_PLACEHOLDER')}
              feedback={
                errors.address?.message
                  ? [{ message: errors.address.message, variant: 'danger' }]
                  : undefined
              }
            />
            <ButtonContainer>
              <Button
                title={
                  mode === 'add' ? t('ADD_ADDRESS.ADD_BUTTON') : t('EDIT_ADDRESS.SAVE_CHANGES')
                }
                loading={isProcessing || isSubmitting}
                disabled={
                  !name ||
                  !address ||
                  isProcessing ||
                  isSubmitting ||
                  (mode === 'edit' &&
                    name === entries.find((entry) => entry.id === id)?.name &&
                    address === entries.find((entry) => entry.id === id)?.address)
                }
              />
            </ButtonContainer>
          </ContentContainer>
        )}
      </FormContainer>
      <BottomTabBar tab="settings" />
    </>
  );
}

export default AddEditAddress;
