import { useMutation } from '@tanstack/react-query';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import onramperApi from './client';

const useInitiateTransaction = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'BUY_SCREEN' });

  return useMutation({
    mutationFn: onramperApi.initiateTransaction,
    onError: (error) => {
      console.error('Error initiating a transaction:', error);
      toast.error(t('ERRORS.INITIATE_TRANSACTION'), { duration: 3000 });
    },
  });
};

export default useInitiateTransaction;
