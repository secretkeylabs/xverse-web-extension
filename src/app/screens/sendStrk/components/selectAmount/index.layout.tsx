import { valibotResolver } from '@hookform/resolvers/valibot';
import { format } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StickyButtonContainer } from '@ui-library/common.styled';
import SendLayout from 'app/layouts/sendLayout';
import BigNumber from 'bignumber.js';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyledForm } from '../common/common.styles';
import SendHeader from '../common/sendHeader';
import { StyledInput } from '../common/styledInput';
import { createFormSchema } from './helpers';
import type { LayoutProps } from './types';

export function Layout({ onSelect, balance, onBack }: LayoutProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { amount: '' },
    resolver: valibotResolver(createFormSchema(balance)),
  });

  const errorMessage = errors.amount?.message;

  return (
    <SendLayout selectedBottomTab="dashboard" onClickBack={onBack}>
      <SendHeader />
      <StyledForm
        onSubmit={handleSubmit(({ amount }) => {
          const amountStrkBN = BigNumber(amount).multipliedBy(BigNumber(1e18));
          onSelect(BigInt(amountStrkBN.toString()));
        })}
      >
        <Controller
          control={control}
          name="amount"
          disabled={isSubmitting}
          render={({ field }) => (
            <>
              <StyledInput
                {...field}
                data-testid="address-receive"
                title={t('AMOUNT')}
                placeholder={t('STRK.AMOUNT')}
                variant={errors.amount ? 'danger' : 'default'}
                feedback={errorMessage ? [{ message: errorMessage, variant: 'danger' }] : undefined}
                autoFocus
              />
              <div>
                {t('BALANCE')}:{' '}
                {format({
                  currency: 'crypto/starknet/starknet',
                  amount: balance,
                })}
              </div>
            </>
          )}
        />

        <StickyButtonContainer>
          <Button title={t('NEXT')} type="submit" disabled={isSubmitting} />
        </StickyButtonContainer>
      </StyledForm>
    </SendLayout>
  );
}
