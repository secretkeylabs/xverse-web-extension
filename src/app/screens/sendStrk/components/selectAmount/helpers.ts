import i18next from 'i18next';
import { units } from 'starknet';
import * as v from 'valibot';

export const createFormSchema = (balanceFri: string | number | bigint) =>
  v.objectAsync({
    /** Amount in STRK */
    amount: v.pipe(
      v.string(),
      v.trim(),
      v.check((amountStrk) => {
        // TODO: check that the amount, when converted to fri, is an integer >
        // 0.

        const amountFriString = units(amountStrk, 'strk');
        const amountFriBigint = BigInt(amountFriString);

        // NOTE: Simple balance check, does not account for fees.
        return amountFriBigint <= BigInt(balanceFri);
      }, i18next.t('SEND.ERRORS.INSUFFICIENT_BALANCE')),
    ),
  });
