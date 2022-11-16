import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import {
  StacksTransaction, cvToHex, uintCV, UnsignedStacksTransation,
} from '@secretkeylabs/xverse-core/types';
import { useMutation } from '@tanstack/react-query';
import { generateUnsignedTransaction } from '@secretkeylabs/xverse-core/transactions';
import { validateStxAddress } from '@secretkeylabs/xverse-core';
import SendForm from '@components/sendForm';
import useStxPendingTxData from '@hooks/useStxPendingTxData';
import useWalletSelector from '@hooks/useWalletSelector';
import TopRow from '@components/topRow';
import BottomBar from '@components/tabBar';
import { checkNftExists } from '@utils/helper';
import NftImage from '@screens/nftDashboard/nftImage';
import useNftDataSelector from '@hooks/useNftDataSelector';

const OuterContainer = styled.div`
display: flex;
flex-direction: column;
flex: 1;
overflow-y: auto;
&::-webkit-scrollbar {
  display: none;
}`;

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
});

const NFtContainer = styled.div((props) => ({
  maxWidth: 450,
  width: '60%',
  display: 'flex',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  padding: props.theme.spacing(5),
  marginTop: props.theme.spacing(15),
  marginBottom: props.theme.spacing(6),
}));

const NftTitleText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

function SendNft() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();
  const { id } = useParams();
  const { nftData } = useNftDataSelector();
  const nftIdDetails = id!.split('::');
  const nft = nftData.find((nftItem) => nftItem?.asset_id === nftIdDetails[1]);
  const { data: stxPendingTxData } = useStxPendingTxData();
  const {
    stxAddress,
    stxPublicKey,
    network,
    feeMultipliers,
  } = useWalletSelector();
  const [error, setError] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const { isLoading, data, mutate } = useMutation<
  StacksTransaction,
  Error,
  { tokenId: string; associatedAddress: string }
  >(async ({ tokenId, associatedAddress }) => {
    const principal = nft?.fully_qualified_token_id?.split('::')!;
    const name = principal[1].split(':')[0];
    const contractInfo: string[] = principal[0].split('.');
    const unsginedTx: UnsignedStacksTransation = {
      amount: tokenId,
      senderAddress: stxAddress,
      recipientAddress: associatedAddress,
      contractAddress: contractInfo[0],
      contractName: contractInfo[1],
      assetName: name,
      publicKey: stxPublicKey,
      network,
      pendingTxs: stxPendingTxData?.pendingTransactions ?? [],
      memo: '',
      isNFT: true,

    };
    const unsignedTx: StacksTransaction = await generateUnsignedTransaction(
      unsginedTx,
    );
    if (feeMultipliers?.stxSendTxMultiplier) {
      unsignedTx.setFee(
        unsignedTx.auth.spendingCondition.fee
          * BigInt(feeMultipliers.stxSendTxMultiplier),
      );
    }
    return unsignedTx;
  });

  useEffect(() => {
    if (data) {
      navigate(`/confirm-nft-tx/${id}`, {
        state: {
          unsignedTx: data,
          recipientAddress,
          nft,
        },
      });
    }
  }, [data]);

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  function validateFields(associatedAddress: string): boolean {
    if (!associatedAddress) {
      setError(t('ERRORS.ADDRESS_REQUIRED'));
      return false;
    }

    if (!validateStxAddress({ stxAddress: associatedAddress, network: network.type })) {
      setError(t('ERRORS.ADDRESS_INVALID'));
      return false;
    }

    if (associatedAddress === stxAddress) {
      setError(t('ERRORS.SEND_TO_SELF'));
      return false;
    }

    return true;
  }

  const onPressSendNFT = async (associatedAddress: string) => {
    if (stxPendingTxData) {
      if (checkNftExists(stxPendingTxData?.pendingTransactions, nft!)) {
        setError(t('ERRORS.NFT_SEND_DETAIL'));
        return;
      }
    }
    setRecipientAddress(associatedAddress);
    if (validateFields(associatedAddress.trim()) && nft) {
      setError('');
      const tokenId = nft?.value?.hex
        ?? cvToHex(uintCV(nft.token_id.toString()));
      mutate({ tokenId, associatedAddress });
    }
  };
  return (
    <OuterContainer>
      <TopRow title={t('SEND_NFT')} onClick={handleBackButtonClick} />
      <Container>
        <NFtContainer>
          <NftImage
            metadata={nft?.token_metadata!}
          />
        </NFtContainer>
        <NftTitleText>{nft?.token_metadata.name}</NftTitleText>
      </Container>
      <SendForm
        processing={isLoading}
        currencyType="NFT"
        disableAmountInput
        error={error}
        onPressSend={onPressSendNFT}
      />
      <BottomBar tab="dashboard" />
    </OuterContainer>
  );
}

export default SendNft;
