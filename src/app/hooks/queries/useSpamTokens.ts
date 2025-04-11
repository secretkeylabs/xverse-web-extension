import { useQuery } from '@tanstack/react-query';

import useXverseApi from '@hooks/apiClients/useXverseApi';
import useWalletSelector from '@hooks/useWalletSelector';
import { setSpamTokensAction } from '@stores/wallet/actions/actionCreators';
import { useDispatch } from 'react-redux';

const useSpamTokens = () => {
  const { network, spamTokens: localSpamTokens } = useWalletSelector();
  const xverseApiClient = useXverseApi();

  const dispatch = useDispatch();

  const getSpamTokens = async (): Promise<string[]> => {
    try {
      const spamTokens: string[] = await xverseApiClient.getSpamTokensList();
      const updatedSpamTokensList = new Set<string>([...localSpamTokens, ...spamTokens]);
      const uniqueSpamTokens = Array.from(updatedSpamTokensList);
      dispatch(setSpamTokensAction(uniqueSpamTokens));
      return uniqueSpamTokens;
    } catch (error) {
      return [];
    }
  };

  const addToSpamTokens = async (token: string) => {
    try {
      const updatedSpamTokensList = new Set<string>([...localSpamTokens, token]);
      const uniqueSpamTokens = Array.from(updatedSpamTokensList);
      dispatch(setSpamTokensAction(uniqueSpamTokens));
    } catch (error) {
      console.error(error);
    }
  };

  const removeFromSpamTokens = async (token: string) => {
    try {
      const updatedSpamTokensList = new Set<string>(localSpamTokens);
      updatedSpamTokensList.delete(token);
      const uniqueSpamTokens = Array.from(updatedSpamTokensList);
      dispatch(setSpamTokensAction(uniqueSpamTokens));
    } catch (error) {
      console.error(error);
    }
  };

  useQuery({
    queryKey: ['spamTokens', network.type],
    queryFn: getSpamTokens,
  });

  return { addToSpamTokens, removeFromSpamTokens };
};

export default useSpamTokens;
