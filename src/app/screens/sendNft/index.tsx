import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';
import AccountHeaderComponent from '@components/accountHeader';
import SendForm from '@components/sendForm';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useStacksCollectibles from '@hooks/queries/useStacksCollectibles';
import useStxPendingTxData from '@hooks/queries/useStxPendingTxData';
import useNetworkSelector from '@hooks/useNetwork';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import NftImage from '@screens/nftDashboard/nftImage';
import {
  cvToHex,
  generateUnsignedTransaction,
  StacksTransaction,
  uintCV,
  UnsignedStacksTransation,
  validateStxAddress,
} from '@secretkeylabs/xverse-core';
import { useMutation } from '@tanstack/react-query';
import { checkNftExists, isLedgerAccount } from '@utils/helper';
import { getNftDataFromNftsCollectionData } from '@utils/nfts';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  width: 360px;
  margin: auto;
`;

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
});

const NftContainer = styled.div((props) => ({
  maxHeight: 148,
  width: 148,
  display: 'flex',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  marginTop: props.theme.spacing(16),
  marginBottom: props.theme.spacing(12),
}));

const NftTitleText = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginLeft: '15%',
  marginTop: props.theme.spacing(40),
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  opacity: 0.8,
  marginTop: props.theme.spacing(5),
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

function SendNft() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();
  const location = useLocation();
  let address: string | undefined;
  if (location.state) {
    address = location.state.recipientAddress;
  }

  const { id } = useParams();
  const stacksNftsQuery = useStacksCollectibles();
  const nftCollections = stacksNftsQuery.data?.pages?.map((page) => page?.results).flat();
  const { nft } = getNftDataFromNftsCollectionData(id, nftCollections);

  const selectedNetwork = useNetworkSelector();
  const { data: stxPendingTxData } = useStxPendingTxData();
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const { stxAddress, stxPublicKey, network, feeMultipliers, selectedAccount } =
    useWalletSelector();
  const [error, setError] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const { isLoading, data, mutate } = useMutation<
    StacksTransaction,
    Error,
    { tokenId: string; associatedAddress: string }
  >({
    mutationFn: async ({ tokenId, associatedAddress }) => {
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
        network: selectedNetwork,
        pendingTxs: stxPendingTxData?.pendingTransactions ?? [],
        memo: '',
        isNFT: true,
      };
      const unsignedTx: StacksTransaction = await generateUnsignedTransaction(unsginedTx);
      if (feeMultipliers?.stxSendTxMultiplier) {
        unsignedTx.setFee(
          unsignedTx.auth.spendingCondition.fee * BigInt(feeMultipliers.stxSendTxMultiplier),
        );
      }
      setRecipientAddress(associatedAddress);
      return unsignedTx;
    },
  });

  useEffect(() => {
    if (data) {
      navigate(`/confirm-nft-tx/${id}`, {
        state: {
          unsignedTx: data.serialize().toString('hex'),
          recipientAddress,
        },
      });
    }
  }, [data]);

  useResetUserFlow('/send-nft');

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
    if (validateFields(associatedAddress.trim()) && nft) {
      setError('');
      const tokenId = cvToHex(uintCV(nft?.token_id.toString()!));
      mutate({ tokenId, associatedAddress });
    }
  };
  return (
    <>
      {isGalleryOpen && (
        <>
          <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
          {!isLedgerAccount(selectedAccount) && (
            <ButtonContainer>
              <Button onClick={handleBackButtonClick}>
                <>
                  <ButtonImage src={ArrowLeft} />
                  <ButtonText>{t('MOVE_TO_ASSET_DETAIL')}</ButtonText>
                </>
              </Button>
            </ButtonContainer>
          )}
        </>
      )}
      <ScrollContainer>
        {!isGalleryOpen && <TopRow title={t('SEND_NFT')} onClick={handleBackButtonClick} />}
        <SendForm
          processing={isLoading}
          currencyType="NFT"
          disableAmountInput
          recepientError={error}
          recipient={address}
          onPressSend={onPressSendNFT}
        >
          <Container>
            <NftContainer>
              <NftImage metadata={nft?.token_metadata!} />
            </NftContainer>
            <NftTitleText>{nft?.token_metadata?.name}</NftTitleText>
          </Container>
        </SendForm>
        <BottomBarContainer>{!isGalleryOpen && <BottomBar tab="nft" />}</BottomBarContainer>
      </ScrollContainer>
    </>
  );
}

export default SendNft;
