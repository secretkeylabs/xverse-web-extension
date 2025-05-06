/* eslint-disable jsx-a11y/label-has-associated-control */
import { valibotResolver } from '@hookform/resolvers/valibot';
import { safeCall } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StickyButtonContainer } from '@ui-library/common.styled';
import SendLayout from 'app/layouts/sendLayout';
import i18next from 'i18next';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { validateAndParseAddress } from 'starknet';
import * as v from 'valibot';
import { StyledForm } from './common/common.styles';
import SendHeader from './common/sendHeader';
import { StyledInput } from './common/styledInput';

function isValidStarknetAddress(address: string): boolean {
  const [error] = safeCall(() => validateAndParseAddress(address));
  return error === null;
}

const createFormSchema = () =>
  v.objectAsync({
    address: v.pipe(
      v.string(),
      v.trim(),
      v.length(66, i18next.t('SEND.STRK.INVALID_LENGTH')),
      v.check(isValidStarknetAddress, i18next.t('SEND.STRK.INVALID_ADDRESS')),
    ),
  });

type Props = {
  onSelect: (recipient: string) => void;
  onBack: () => void;
};

export function SelectRecipient({ onSelect, onBack }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { address: '' },
    resolver: valibotResolver(createFormSchema()),
  });

  const errorMessage = errors.address?.message;

  return (
    <SendLayout selectedBottomTab="dashboard" onClickBack={onBack}>
      <SendHeader />
      <StyledForm onSubmit={handleSubmit(({ address }) => onSelect(address))}>
        <Controller
          control={control}
          name="address"
          disabled={isSubmitting}
          render={({ field }) => (
            <StyledInput
              {...field}
              data-testid="address-receive"
              title={t('RECIPIENT')}
              placeholder={t('STRK.RECIPIENT_PLACEHOLDER')}
              variant={errors.address ? 'danger' : 'default'}
              feedback={errorMessage ? [{ message: errorMessage, variant: 'danger' }] : undefined}
              autoFocus
            />
          )}
        />

        <StickyButtonContainer>
          <Button title={t('NEXT')} type="submit" disabled={isSubmitting} />
        </StickyButtonContainer>
      </StyledForm>
    </SendLayout>
  );
}
