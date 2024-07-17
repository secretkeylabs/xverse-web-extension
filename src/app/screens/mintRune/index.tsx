import ConfirmBtcTransaction from '@components/confirmBtcTransaction';
import RequestError from '@components/requests/requestError';
import { RUNE_DISPLAY_DEFAULTS, type Transport } from '@secretkeylabs/xverse-core';
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

  const onClickConfirm = async (ledgerTransport?: Transport) => {
    const txid = await payAndConfirmMintRequest(ledgerTransport);
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
          inputs={orderTx.summary.inputs}
          outputs={orderTx.summary.outputs}
          feeOutput={orderTx.summary.feeOutput}
          feeRate={+feeRate}
          showCenotaphCallout={false}
          confirmText={t('CONFIRM')}
          cancelText={t('CANCEL')}
          isBroadcast
          isLoading={false}
          onCancel={onClickCancel}
          onConfirm={onClickConfirm}
          runeSummary={{
            burns: [],
            inputsHadRunes: false,
            receipts: [],
            transfers: [],
            mint: {
              repeats: mintRequest.repeats,
              runeSize: RUNE_DISPLAY_DEFAULTS.size,
              runeName: runeInfo.entry.spaced_rune,
              amount: BigInt(runeInfo.entry.terms.amount?.toNumber() ?? 0),
              inscriptionId: runeInfo.parent ?? '',
              runeIsMintable: runeInfo.mintable,
              runeIsOpen: runeInfo.mintable,
              symbol: runeInfo.entry.symbol,
              divisibility: runeInfo.entry.divisibility.toNumber(),
              destinationAddress: mintRequest.destinationAddress,
            },
          }}
          isSubmitting={isExecuting}
          hideBottomBar
          showAccountHeader
        />
      )}
    </>
  );
}

export default MintRune;
