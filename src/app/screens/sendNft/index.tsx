import ActionButton from '@components/button';
import useXverseApi from '@hooks/apiClients/useXverseApi';
import { useBnsName, useBnsResolver } from '@hooks/queries/useBnsName';
import useNftDetail from '@hooks/queries/useNftDetail';
import useStxPendingTxData from '@hooks/queries/useStxPendingTxData';
import useDebounce from '@hooks/useDebounce';
import useNetworkSelector from '@hooks/useNetwork';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  cvToHex,
  generateUnsignedNftTransferTransaction,
  uintCV,
  validateStxAddress,
} from '@secretkeylabs/xverse-core';
import { StacksTransactionWire } from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';
import { StickyButtonContainer, StyledHeading, StyledP } from '@ui-library/common.styled';
import {
  InputFeedback,
  isDangerFeedback,
  type InputFeedbackProps,
} from '@ui-library/inputFeedback';
import { checkNftExists } from '@utils/helper';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import SendLayout from '../../layouts/sendLayout';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
`;

const StyledSendTo = styled(StyledHeading)`
  margin-bottom: ${(props) => props.theme.space.l};
`;

const InputGroup = styled.div`
  margin-top: ${(props) => props.theme.spacing(8)}px;
`;

const Label = styled.label((props) => ({
  ...props.theme.typography.body_medium_m,
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
  ...props.theme.typography.body_m,
  backgroundColor: 'transparent',
  color: props.theme.colors.white_0,
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

function SendNft() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();
  const location = useLocation();
  const [recipientError, setRecipientError] = useState<InputFeedbackProps | null>(null);
  const [recipientAddress, setRecipientAddress] = useState(location.state?.recipientAddress ?? '');

  useResetUserFlow('/send-nft');

  const { id } = useParams();
  const { data: nftDetail } = useNftDetail(id!);
  const nft = nftDetail?.data;

  const selectedNetwork = useNetworkSelector();
  const { data: stxPendingTxData } = useStxPendingTxData();
  const { stxAddress, stxPublicKey } = useSelectedAccount();
  const { network } = useWalletSelector();
  const debouncedSearchTerm = useDebounce(recipientAddress, 300);
  const associatedBnsName = useBnsName(debouncedSearchTerm);
  const associatedAddress = useBnsResolver(debouncedSearchTerm, stxAddress);
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

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(e.target.value.trim());
  };

  useEffect(() => {
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
    if (associatedAddress) {
      validateRecipientAddress(associatedAddress);
    } else if (recipientAddress) {
      validateRecipientAddress(recipientAddress);
    }
  }, [associatedAddress, recipientAddress, network.type, stxAddress, t]);

  const isNextEnabled = !isDangerFeedback(recipientError) && !!recipientAddress;

  // hide back button if there is no history
  const hideBackButton = location.key === 'default';

  return (
    <SendLayout
      selectedBottomTab="nft"
      onClickBack={handleBackButtonClick}
      hideBackButton={hideBackButton}
    >
      <Container>
        <div>
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
                  placeholder={t('RECIPIENT_PLACEHOLDER')}
                  onChange={handleAddressChange}
                />
              </InputFieldContainer>
            </AmountInputContainer>
            {associatedAddress && (
              <>
                <StyledP typography="body_s" color="white_400">
                  {t('ASSOCIATED_ADDRESS')}
                </StyledP>
                <StyledP typography="body_s" color="white">
                  {associatedAddress}
                </StyledP>
              </>
            )}
            {associatedBnsName && (
              <>
                <StyledP typography="body_s" color="white_400">
                  {t('ASSOCIATED_BNS_DOMAIN')}
                </StyledP>
                <StyledP typography="body_s" color="white">
                  {associatedBnsName}
                </StyledP>
              </>
            )}
            <ErrorContainer>
              {recipientError && <InputFeedback {...recipientError} />}
            </ErrorContainer>
          </InputGroup>
        </div>
        <StickyButtonContainer>
          <ActionButton
            text={t('NEXT')}
            disabled={!isNextEnabled}
            processing={isLoading}
            onPress={onPressNext}
          />
        </StickyButtonContainer>
      </Container>
    </SendLayout>
  );
}

export default SendNft;
