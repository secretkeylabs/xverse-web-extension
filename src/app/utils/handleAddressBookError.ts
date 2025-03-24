import { CoreError } from '@secretkeylabs/xverse-core';
import { ErrorCodes } from '@secretkeylabs/xverse-core/addressBook/errors';
import type { TFunction } from 'i18next';
import { toast } from 'react-hot-toast';

// Map error codes to translation keys
const errorCodeToTranslationKey: Record<string, string> = {
  [ErrorCodes.AddressAlreadyExists]: 'ADDRESS_ALREADY_EXISTS',
  [ErrorCodes.EntryNotFound]: 'ENTRY_NOT_FOUND',
  [ErrorCodes.InvalidAddress]: 'INVALID_ADDRESS',
  [ErrorCodes.NameAlreadyExists]: 'NAME_ALREADY_EXISTS',
  [ErrorCodes.InvalidName]: 'INVALID_NAME',
  [ErrorCodes.NameTooLong]: 'NAME_TOO_LONG',
  [ErrorCodes.ProhibitedSymbols]: 'PROHIBITED_SYMBOLS',
  [ErrorCodes.InvalidChain]: 'INVALID_CHAIN',
};

/**
 * Handles errors from addressbook mutations
 * @param error The error to handle
 * @param t Translation function with keyPrefix 'SETTING_SCREEN.ADDRESS_BOOK.ERROR'
 */
export const handleAddressBookError = (error: unknown, t: TFunction, tCommon: TFunction): void => {
  console.error('Address book operation error:', error);

  if (error instanceof Error) {
    if (CoreError.isCoreError(error) && error.code) {
      // Get the translation key for the error code or use the error message if not found
      const translationKey = errorCodeToTranslationKey[error.code];
      if (translationKey) {
        toast.error(t(translationKey));
      } else {
        // If it's a CoreError but with an unknown code, display the message
        toast.error(error.message);
      }
    } else {
      // For non-CoreError instances, display a generic error message
      toast.error(tCommon('SOMETHING_WENT_WRONG'));
    }
  } else {
    // For non-Error objects, display a generic error message
    toast.error(tCommon('SOMETHING_WENT_WRONG'));
  }
};
