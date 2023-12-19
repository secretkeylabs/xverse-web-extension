import AssetIcon from '@assets/img/transactions/Assets.svg';
import { ConfirmStxTransactionState, LedgerTransactionType } from '@common/types/ledger';
import AccountHeaderComponent from '@components/accountHeader';
import ConfirmStxTransationComponent from '@components/confirmStxTransactionComponent';
import RecipientComponent from '@components/recipientComponent';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useNftDetail from '@hooks/queries/useNftDetail';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useNetworkSelector from '@hooks/useNetwork';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import NftImage from '@screens/nftDashboard/nftImage';
import { broadcastSignedTransaction, StacksTransaction } from '@secretkeylabs/xverse-core';
import { deserializeTransaction } from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';
import { isLedgerAccount } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo } from 'react';
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
  height: 600px;
  width: 360px;
  margin: auto;
`;

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const NftContainer = styled.div((props) => ({
  maxWidth: 120,
  maxHeight: 120,
  width: '60%',
  display: 'flex',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  padding: props.theme.spacing(5),
  marginBottom: props.theme.spacing(6),
}));

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(16),
  textAlign: 'center',
}));

function ConfirmNftTransaction() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const { selectedAccount } = useWalletSelector();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const nftDetailQuery = useNftDetail(id!);
  const nft = nftDetailQuery.data?.data;

  const { unsignedTx: unsignedTxHex, recipientAddress } = location.state;
  const unsignedTx = useMemo(() => deserializeTransaction(unsignedTxHex), [unsignedTxHex]);
  const { network } = useWalletSelector();
  const { refetch } = useStxWalletData();
  const selectedNetwork = useNetworkSelector();
  const {
    isLoading,
    error: txError,
    data: stxTxBroadcastData,
    mutate,
  } = useMutation<string, Error, { signedTx: StacksTransaction }>({
    mutationFn: async ({ signedTx }) => broadcastSignedTransaction(signedTx, selectedNetwork),
  });
  const initialStxTransactions = [unsignedTx];

  useEffect(() => {
    if (stxTxBroadcastData) {
      navigate('/tx-status', {
        state: {
          txid: stxTxBroadcastData,
          currency: 'STX',
          error: '',
          isNft: true,
        },
      });
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  }, [stxTxBroadcastData]);

  useEffect(() => {
    if (txError) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          error: txError.toString(),
          isNft: true,
        },
      });
    }
  }, [txError]);

  const handleOnConfirmClick = (txs: StacksTransaction[]) => {
    if (isLedgerAccount(selectedAccount)) {
      const type: LedgerTransactionType = 'STX';
      const state: ConfirmStxTransactionState = {
        unsignedTx: unsignedTx.serialize(),
        type,
        recipients: [
          {
            address: recipientAddress,
            amountMicrostacks: (unsignedTx?.payload as any)?.amount // TODO fix type error
              ? new BigNumber((unsignedTx?.payload as any).amount?.toString(10)) // TODO fix type error
              : new BigNumber(0),
          },
        ],
        fee: new BigNumber(
          initialStxTransactions
            .map((tx) => tx?.auth?.spendingCondition?.fee ?? BigInt(0))
            .reduce((prev, curr) => prev + curr, BigInt(0))
            .toString(10),
        ),
      };

      navigate('/confirm-ledger-tx', { state });
      return;
    }

    mutate({ signedTx: txs[0] });
  };

  useResetUserFlow('/confirm-nft-tx');

  const handleOnCancelClick = () => {
    navigate(-1);
  };

  return (
    <>
      {isGalleryOpen && (
        <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
      )}
      <ScrollContainer>
        {!isGalleryOpen && <TopRow title={t('CONFIRM_TX')} onClick={handleOnCancelClick} />}
        <ConfirmStxTransationComponent
          initialStxTransactions={initialStxTransactions}
          loading={isLoading}
          onConfirmClick={handleOnConfirmClick}
          onCancelClick={handleOnCancelClick}
          isAsset
          skipModal={isLedgerAccount(selectedAccount)}
        >
          <Container>
            <NftContainer>
              <NftImage metadata={nft?.token_metadata!} />
            </NftContainer>
            <ReviewTransactionText>{t('REVIEW_TRANSACTION')}</ReviewTransactionText>
          </Container>
          <RecipientComponent
            address={recipientAddress}
            value={nft?.token_metadata.name!}
            icon={AssetIcon}
            currencyType="NFT"
            title={t('ASSET')}
          />
          <TransactionDetailComponent title={t('NETWORK')} value={network.type} />
        </ConfirmStxTransationComponent>
        {!isGalleryOpen && <BottomBar tab="nft" />}
      </ScrollContainer>
    </>
  );
}
export default ConfirmNftTransaction;
