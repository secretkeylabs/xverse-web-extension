import ConfirmBtcTransaction from '@components/confirmBtcTransaction';
import RequestError from '@components/requests/requestError';
import {
  RUNE_DISPLAY_DEFAULTS,
  type KeystoneTransport,
  type LedgerTransport,
} from '@secretkeylabs/xverse-core';
import Spinner from '@ui-library/spinner';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useMintRequest from './useMintRequest';

const LoaderContainer = styled.div(() => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}));

function MintRune() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const navigate = useNavigate();
  const {
    mintRequest,
    runeInfo,
    orderTx,
    feeRate,
    mintError,
    isExecuting,
    handleMint,
    payAndConfirmMintRequest,
    cancelMintRequest,
  } = useMintRequest();

  const createAndLoadOrder = useCallback(async () => {
    await handleMint();
  }, []);

  useEffect(() => {
    createAndLoadOrder();
  }, [createAndLoadOrder]);

  const onClickCancel = async () => {
    await cancelMintRequest();
    window.close();
  };

  const onClickConfirm = async (options?: {
    ledgerTransport?: LedgerTransport;
    keystoneTransport?: KeystoneTransport;
  }) => {
    const txid = await payAndConfirmMintRequest(options);
    if (txid) {
      navigate('/tx-status', {
        state: {
          txid,
          currency: 'BTC',
          error: '',
          browserTx: true,
        },
      });
    }
  };

  return (
    <>
      {mintError && <RequestError error={mintError.message} onClose={onClickCancel} />}
      {!orderTx && !mintError && (
        <LoaderContainer>
          <Spinner size={50} />
        </LoaderContainer>
      )}
      {orderTx && orderTx.summary && runeInfo && !mintError && (
        <ConfirmBtcTransaction
          summary={orderTx.summary}
          runeMintDetails={{
            runeId: runeInfo.id,
            runeName: runeInfo.entry.spaced_rune,
            amount: BigInt(runeInfo.entry.terms.amount?.toNumber() ?? 0),
            divisibility: runeInfo.entry.divisibility.toNumber(),
            symbol: runeInfo.entry.symbol,
            inscriptionId: runeInfo.parent ?? '',
            runeIsOpen: runeInfo.mintable,
            runeIsMintable: runeInfo.mintable,
            destinationAddress: mintRequest.destinationAddress,
            repeats: mintRequest.repeats,
            runeSize: RUNE_DISPLAY_DEFAULTS.size,
          }}
          feeRate={+feeRate}
          confirmText={t('CONFIRM')}
          cancelText={t('CANCEL')}
          isBroadcast
          isLoading={false}
          onCancel={onClickCancel}
          onConfirm={onClickConfirm}
          isSubmitting={isExecuting}
          hideBottomBar
          showAccountHeader
        />
      )}
    </>
  );
}

export default MintRune;
