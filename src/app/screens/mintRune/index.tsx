import ConfirmBtcTransaction from '@components/confirmBtcTransaction';
import RequestError from '@components/requests/requestError';
import {
  RUNE_DISPLAY_DEFAULTS,
  type KeystoneTransport,
  type LedgerTransport,
} from '@secretkeylabs/xverse-core';
import Spinner from '@ui-library/spinner';
import { useEffect } from 'react';
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
    loading: paramsLoading,
    error: paramsError,
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

  useEffect(() => {
    if (paramsLoading || paramsError || !mintRequest) {
      return;
    }
    handleMint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsLoading, paramsError, mintRequest]);

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

  if (paramsError) {
    return <RequestError error={paramsError} onClose={onClickCancel} />;
  }

  return (
    <>
      {mintError && <RequestError error={mintError.message} onClose={onClickCancel} />}
      {(paramsLoading || (!orderTx && !mintError)) && (
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
