import AccountHeaderComponent from '@components/accountHeader';
import ActionButton from '@components/button';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useStacksCollectibles from '@hooks/queries/useStacksCollectibles';
import useStxPendingTxData from '@hooks/queries/useStxPendingTxData';
import useNetworkSelector from '@hooks/useNetwork';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowLeft } from '@phosphor-icons/react';
import {
  cvToHex,
  generateUnsignedTransaction,
  StacksTransaction,
  uintCV,
  UnsignedStacksTransation,
  validateStxAddress,
} from '@secretkeylabs/xverse-core';
import { useMutation } from '@tanstack/react-query';
import Callout from '@ui-library/callout';
import { StyledHeading, StyledP } from '@ui-library/common.styled';
import { InputFeedback, InputFeedbackProps, isDangerFeedback } from '@ui-library/inputFeedback';
import { checkNftExists, isLedgerAccount } from '@utils/helper';
import { getNftDataFromNftsCollectionData } from '@utils/nfts';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { devices } from 'theme';

const ScrollContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  ...props.theme.scrollbar,
}));

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: auto;
  margin-top: ${(props) => props.theme.space.xxs};
  padding: 0 ${(props) => props.theme.space.s};
  justify-content: space-between;
  max-width: 360px;

  @media only screen and ${devices.min.s} {
    flex: initial;
    max-width: 588px;
    border: 1px solid ${(props) => props.theme.colors.elevation3};
    border-radius: ${(props) => props.theme.space.s};
    padding: ${(props) => props.theme.space.l} ${(props) => props.theme.space.m};
    padding-bottom: ${(props) => props.theme.space.xxl};
    margin-top: ${(props) => props.theme.space.xxxxl};
    min-height: 600px;
  }
`;

const FooterContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.space.xxl};
`;

const StyledSendTo = styled(StyledHeading)`
  margin-bottom: ${(props) => props.theme.space.l};
`;

const NextButtonContainer = styled.div((props) => ({
  position: 'sticky',
  bottom: 0,
  paddingBottom: props.theme.spacing(12),
  paddingTop: props.theme.spacing(12),
  backgroundColor: props.theme.colors.elevation0,
}));

const InputGroup = styled.div`
  margin-top: ${(props) => props.theme.spacing(8)}px;
`;

const Label = styled.label((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_200,
  display: 'flex',
  flex: 1,
}));

const AmountInputContainer = styled.div<{ error: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
  border: props.error
    ? `1px solid ${props.theme.colors.danger_dark_200}`
    : `1px solid ${props.theme.colors.white_800}`,
  backgroundColor: props.theme.colors.elevation_n1,
  borderRadius: props.theme.radius(1),
  paddingLeft: props.theme.spacing(5),
  paddingRight: props.theme.spacing(5),
  height: 44,
}));

const InputFieldContainer = styled.div(() => ({
  flex: 1,
}));

const InputField = styled.input((props) => ({
  ...props.theme.body_m,
  backgroundColor: 'transparent',
  color: props.theme.colors.white['0'],
  width: '100%',
  border: 'transparent',
}));

const ErrorContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(3),
  marginBottom: props.theme.spacing(12),
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const StyledCallout = styled(Callout)`
  margin-bottom: ${(props) => props.theme.spacing(14)}px;
`;

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

const Button = styled.button`
  display: flex;
  background-color: transparent;
  margin-bottom: ${(props) => props.theme.space.l};
`;

function SendNft() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();
  const location = useLocation();
  const [recipientError, setRecipientError] = useState<InputFeedbackProps | null>(null);
  const [recipientAddress, setRecipientAddress] = useState(location.state?.recipientAddress ?? '');

  useResetUserFlow('/send-nft');

  const { id } = useParams();
  const stacksNftsQuery = useStacksCollectibles();
  const nftCollections = stacksNftsQuery.data?.pages?.map((page) => page?.results).flat();
  const { nftData: nft } = getNftDataFromNftsCollectionData(id, nftCollections);

  const selectedNetwork = useNetworkSelector();
  const { data: stxPendingTxData } = useStxPendingTxData();
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const { stxAddress, stxPublicKey, network, feeMultipliers, selectedAccount } =
    useWalletSelector();

  const { isLoading, data, mutate } = useMutation<
    StacksTransaction,
    Error,
    { tokenId: string; address: string }
  >({
    mutationFn: async ({ tokenId, address }) => {
      const principal = nft?.fully_qualified_token_id?.split('::')!;
      const name = principal[1].split(':')[0];
      const contractInfo: string[] = principal[0].split('.');
      const unsginedTx: UnsignedStacksTransation = {
        amount: tokenId,
        senderAddress: stxAddress,
        recipientAddress: address,
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
      setRecipientAddress(address);
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

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const validateRecipientAddress = (address: string): boolean => {
    if (!address) {
      setRecipientError({ variant: 'danger', message: t('ERRORS.ADDRESS_REQUIRED') });
      return false;
    }
    if (!validateStxAddress({ stxAddress: address, network: network.type })) {
      setRecipientError({ variant: 'danger', message: t('ERRORS.ADDRESS_INVALID') });
      return false;
    }
    if (address === stxAddress) {
      setRecipientError({ variant: 'info', message: t('YOU_ARE_TRANSFERRING_TO_YOURSELF') });
      return true;
    }
    setRecipientError(null);
    return true;
  };

  const onPressNext = async () => {
    if (stxPendingTxData) {
      if (checkNftExists(stxPendingTxData?.pendingTransactions, nft!)) {
        setRecipientError({ variant: 'danger', message: t('ERRORS.NFT_SEND_DETAIL') });
        return;
      }
    }
    if (validateRecipientAddress(recipientAddress.trim()) && nft) {
      const tokenId = cvToHex(uintCV(nft?.token_id.toString()!));
      mutate({ tokenId, address: recipientAddress });
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateRecipientAddress(e.target.value);
    setRecipientAddress(e.target.value);
  };

  const isNextEnabled = !isDangerFeedback(recipientError) && !!recipientAddress;
  const year = new Date().getFullYear();

  return (
    <>
      {isGalleryOpen && (
        <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
      )}
      {!isGalleryOpen && <TopRow title="" onClick={handleBackButtonClick} />}
      <ScrollContainer>
        <Container>
          <div>
            {isGalleryOpen && !isLedgerAccount(selectedAccount) && (
              <Button onClick={handleBackButtonClick}>
                <ArrowLeft size={20} color="white" />
              </Button>
            )}
            <StyledSendTo typography="headline_xs" color="white_0">
              {t('SEND_TO')}
            </StyledSendTo>
            <InputGroup>
              <RowContainer>
                <Label>{t('RECIPIENT')}</Label>
              </RowContainer>
              <AmountInputContainer error={isDangerFeedback(recipientError)}>
                <InputFieldContainer>
                  <InputField
                    value={recipientAddress}
                    placeholder={t('ORDINAL_RECIPIENT_PLACEHOLDER')}
                    onChange={handleAddressChange}
                  />
                </InputFieldContainer>
              </AmountInputContainer>
              <ErrorContainer>
                {recipientError && <InputFeedback {...recipientError} />}
              </ErrorContainer>
            </InputGroup>
            <StyledCallout bodyText={t('MAKE_SURE_THE_RECIPIENT')} />
          </div>
          <NextButtonContainer>
            <ActionButton
              text={t('NEXT')}
              disabled={!isNextEnabled}
              processing={isLoading}
              onPress={onPressNext}
            />
          </NextButtonContainer>
        </Container>
        {isGalleryOpen && (
          <FooterContainer>
            <StyledP typography="body_medium_m" color="white_400">
              {t('COPYRIGHT', { year })}
            </StyledP>
          </FooterContainer>
        )}
      </ScrollContainer>
      <BottomBarContainer>{!isGalleryOpen && <BottomBar tab="nft" />}</BottomBarContainer>
    </>
  );
}

export default SendNft;
