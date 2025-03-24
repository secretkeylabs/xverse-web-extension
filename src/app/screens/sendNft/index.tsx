import RecipientSelector from '@components/recipientSelector';
import useXverseApi from '@hooks/apiClients/useXverseApi';
import { useBnsResolver } from '@hooks/queries/useBnsName';
import useNftDetail from '@hooks/queries/useNftDetail';
import useStxPendingTxData from '@hooks/queries/useStxPendingTxData';
import useDebounce from '@hooks/useDebounce';
import useNetworkSelector from '@hooks/useNetwork';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import {
  cvToHex,
  generateUnsignedNftTransferTransaction,
  uintCV,
} from '@secretkeylabs/xverse-core';
import { StacksTransactionWire } from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';
import { isDangerFeedback, type InputFeedbackProps } from '@ui-library/inputFeedback';
import { checkNftExists } from '@utils/helper';
import { RoutePathsSuffixes } from 'app/routes/paths';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

function SendNft() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();
  const location = useLocation();
  const [recipientError, setRecipientError] = useState<InputFeedbackProps | null>(null);
  const [recipientAddress, setRecipientAddress] = useState(location.state?.recipientAddress ?? '');

  useResetUserFlow(RoutePathsSuffixes.SendNft);

  const { id } = useParams();
  const { data: nftDetail } = useNftDetail(id!);
  const nft = nftDetail?.data;

  const selectedNetwork = useNetworkSelector();
  const { data: stxPendingTxData } = useStxPendingTxData();
  const { stxAddress, stxPublicKey } = useSelectedAccount();
  const debouncedSearchTerm = useDebounce(recipientAddress, 300);
  const { data: associatedAddress } = useBnsResolver(debouncedSearchTerm, stxAddress);
  const [searchParams] = useSearchParams();
  const xverseApiClient = useXverseApi();

  const { isLoading, data, mutate } = useMutation<
    StacksTransactionWire,
    Error,
    { tokenId: string; address: string }
  >({
    mutationFn: async ({ tokenId, address }) => {
      const principal = nft?.fully_qualified_token_id?.split('::')!;
      const name = principal[1].split(':')[0];
      const contractInfo: string[] = principal[0].split('.');
      const options = {
        amount: tokenId,
        senderAddress: stxAddress,
        recipientAddress: address,
        contractAddress: contractInfo[0],
        contractName: contractInfo[1],
        assetName: name,
        publicKey: stxPublicKey,
        network: selectedNetwork,
        memo: '',
        xverseApiClient,
      };
      const unsignedTx = await generateUnsignedNftTransferTransaction(options);
      setRecipientAddress(address);
      return unsignedTx;
    },
  });

  useEffect(() => {
    if (data) {
      navigate(`/confirm-nft-tx/${id}`, {
        state: {
          unsignedTx: data.serialize(),
          recipientAddress,
        },
      });
    }
  }, [data]);

  useEffect(() => {
    const recipient = searchParams.get('address');
    if (recipient) {
      setRecipientAddress(recipient);
    }
  }, [searchParams]);

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const onPressNext = async () => {
    if (stxPendingTxData) {
      if (checkNftExists(stxPendingTxData?.pendingTransactions, nft!)) {
        setRecipientError({ variant: 'danger', message: t('ERRORS.NFT_SEND_DETAIL') });
        return;
      }
    }
    if (!isDangerFeedback(recipientError) && nft) {
      const tokenId = cvToHex(uintCV(nft?.token_id.toString()!));
      mutate({ tokenId, address: associatedAddress || recipientAddress });
    }
  };

  return (
    <RecipientSelector
      recipientAddress={recipientAddress}
      recipientError={recipientError}
      setRecipientAddress={setRecipientAddress}
      onNext={onPressNext}
      isLoading={isLoading}
      recipientPlaceholder={t('RECIPIENT_PLACEHOLDER')}
      onBack={handleBackButtonClick}
      selectedBottomTab="nft"
      addressType="stx"
    />
  );
}

export default SendNft;
