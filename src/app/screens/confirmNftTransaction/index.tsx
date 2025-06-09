import AssetIcon from '@assets/img/transactions/Assets.svg';
import type { ConfirmStxTransactionState } from '@common/types/ledger';
import AccountHeaderComponent from '@components/accountHeader';
import ConfirmStxTransactionComponent from '@components/confirmStxTransactionComponent';
import RecipientComponent from '@components/recipientComponent';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useNftDetail from '@hooks/queries/useNftDetail';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useNetworkSelector from '@hooks/useNetwork';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import NftImage from '@screens/nftDashboard/nftImage';
import {
  AnalyticsEvents,
  broadcastSignedTransaction,
  microstacksToStx,
  stxToMicrostacks,
} from '@secretkeylabs/xverse-core';
import { deserializeTransaction, StacksTransactionWire } from '@stacks/transactions';
import { removeAccountAvatarAction } from '@stores/wallet/actions/actionCreators';
import { useMutation } from '@tanstack/react-query';
import { POPUP_WIDTH } from '@utils/constants';
import { isLedgerAccount } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
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
  width: ${POPUP_WIDTH}px;
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
  marginBottom: props.theme.space.s,
}));

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.space.xl,
  textAlign: 'center',
}));

function ConfirmNftTransaction() {
  const dispatch = useDispatch();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const isGalleryOpen: boolean = document.documentElement.clientWidth > POPUP_WIDTH;
  const selectedAccount = useSelectedAccount();
  const { avatarIds, network } = useWalletSelector();
  const selectedAvatar = avatarIds[selectedAccount.ordinalsAddress];
  const [fee, setFee] = useState<BigNumber>();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const nftDetailQuery = useNftDetail(id!);
  const nft = nftDetailQuery.data?.data;

  const { unsignedTx: unsignedTxHex, recipientAddress } = location.state;
  const unsignedTx = useMemo(() => deserializeTransaction(unsignedTxHex), [unsignedTxHex]);
  const { refetch } = useStxWalletData();
  const selectedNetwork = useNetworkSelector();
  const {
    isPending,
    error: txError,
    data: stxTxBroadcastData,
    mutate,
  } = useMutation<string, Error, { signedTx: StacksTransactionWire }>({
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

      if (selectedAvatar?.type === 'stacks' && selectedAvatar.nft?.token_id === nft?.token_id) {
        dispatch(removeAccountAvatarAction({ address: selectedAccount.ordinalsAddress }));
      }
    }
  }, [
    dispatch,
    navigate,
    refetch,
    stxTxBroadcastData,
    selectedAccount.ordinalsAddress,
    nft,
    selectedAvatar,
  ]);

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

  const handleOnConfirmClick = (txs: StacksTransactionWire[]) => {
    if (isLedgerAccount(selectedAccount)) {
      const state: ConfirmStxTransactionState = {
        unsignedTx: Buffer.from(unsignedTx.serializeBytes()),
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

      navigate('/confirm-ledger-stx-tx', { state });
      return;
    }

    trackMixPanel(AnalyticsEvents.TransactionConfirmed, {
      protocol: 'stacks-nfts',
      action: 'transfer',
      wallet_type: selectedAccount?.accountType || 'software',
    });

    mutate({ signedTx: txs[0] });
  };

  useResetUserFlow('/confirm-nft-tx');

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const handleOnCancelClick = () => {
    navigate(`/nft-dashboard/nft-detail/${id}`);
  };

  return (
    <>
      {isGalleryOpen && (
        <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
      )}
      <ScrollContainer>
        {!isGalleryOpen && <TopRow title={t('CONFIRM_TX')} onClick={handleBackButtonClick} />}
        <ConfirmStxTransactionComponent
          initialStxTransactions={initialStxTransactions}
          loading={isPending}
          onConfirmClick={handleOnConfirmClick}
          onCancelClick={handleOnCancelClick}
          isAsset
          skipModal={isLedgerAccount(selectedAccount)}
          fee={fee ? microstacksToStx(fee).toString() : undefined}
          setFeeRate={(feeRate: string) => {
            setFee(stxToMicrostacks(new BigNumber(feeRate)));
          }}
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
        </ConfirmStxTransactionComponent>
        {!isGalleryOpen && <BottomBar tab="nft" />}
      </ScrollContainer>
    </>
  );
}

export default ConfirmNftTransaction;
