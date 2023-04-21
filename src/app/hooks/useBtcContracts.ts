import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreState } from '@stores/index';

import { ContractUpdater, DlcManager, DlcSigner, ContractState } from 'dlc-lib';

import LocalRepository from 'app/dlcClasses/persistence/localRepository';
import EsploraBlockchain from 'app/dlcClasses/EsploraBlockchain';
import DlcService from 'app/dlcClasses/DlcService';

import {
  contractSuccess,
  contractError,
  actionSuccess,
  actionError,
  offerRequest,
  acceptRequest,
  signRequest,
  rejectRequest,
} from '@stores/dlc/actions/actionCreators';

import useBtcClient from './useBtcClient';
import useBtcWalletData from './queries/useBtcWalletData';

import { getBtcNativeSegwitPrivateKey } from '@secretkeylabs/xverse-core';
import { Transaction } from 'bitcoinjs-lib';

const useBtcContracts = () => {
  const btcClient = useBtcClient();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isRegtest, setIsRegtest] = useState(false);

  const blockchain = new EsploraBlockchain(
    (txid: string) => btcClient.getRawTransaction(txid),
    (txHex: string) => btcClient.sendRawTransaction(txHex),
    (address: string) => btcClient.getUnspentUtxos(address)
  );
  const dlcStorage = new LocalRepository();
  const dlcSigner = new DlcSigner();
  const contractUpdater = new ContractUpdater(dlcSigner, blockchain);
  const dlcManager = new DlcManager(contractUpdater, dlcStorage);
  const dlcService = new DlcService(dlcManager, dlcStorage);

  const { dlcBtcAddress, dlcBtcPublicKey, seedPhrase, network, selectedAccount, btcApiUrl } =
    useSelector((state: StoreState) => state.walletState);

  const {
    selectedContract,
    currentId,
    counterpartyWalletUrl,
    success,
    error,
    acceptMessageSubmitted,
  } = useSelector((state: StoreState) => state.dlcState);

  const { refetch } = useBtcWalletData();

  async function deriveBtcNativeSegwitPrivateKey() {
    const btcPrivateKey = await getBtcNativeSegwitPrivateKey({
      seedPhrase,
      index: BigInt(selectedAccount?.id ?? 0),
      network,
    });
    return btcPrivateKey;
  }

  async function handleContracts() {
    try {
      const contracts = await dlcService.getAllContracts();
      dispatch(contractSuccess(contracts));
    } catch (error) {
      dispatch(contractError(`HandleContracts Effect Failure: ${error}`));
    }
  }

  async function handleOffer(offer: string, counterpartyWalletUrl: string) {
    dispatch(offerRequest(counterpartyWalletUrl));
    try {
      const contract = await dlcService.processContractOffer(offer);
      dispatch(actionSuccess(contract));
    } catch (error) {
      console.log(error, 'error');
      dispatch(actionError({ error: `HandleOffer Effect Failure: ${error}` }));
    }
  }

  async function handleAccept(contractID: string) {
    const dlcBtcPrivateKey = await deriveBtcNativeSegwitPrivateKey();
    try {
      dispatch(acceptRequest());
      const contract = await dlcService.acceptContract(
        contractID,
        dlcBtcAddress,
        dlcBtcPublicKey,
        dlcBtcPrivateKey,
        network.type,
      );
      dispatch(actionSuccess(contract));
    } catch (error) {
      dispatch(actionError({ error: `HandleAccept Effect Failure: ${error}` }));
    }
  }

  async function handleReject(contractID: string) {
    try {
      dispatch(rejectRequest());
      const contract = await dlcService.rejectContract(contractID);
      dispatch(actionSuccess(contract));
    } catch (error) {
      dispatch(actionError({ error: `HandleReject Effect Failure: ${error}` }));
    }
  }

  async function handleSign(contractID: string, counterpartyWalletURL: string) {
    const dlcBtcPrivateKey = await deriveBtcNativeSegwitPrivateKey();
    try {
      dispatch(signRequest());
      const contract = await dlcService.processContractSign(
        contractID,
        dlcBtcPrivateKey,
        counterpartyWalletURL
      );
      dispatch(actionSuccess(contract));
    } catch (error) {
      dispatch(actionError({ error: `HandleSign Effect Failure: ${error}` }));
    }
  }

  useEffect(() => {
    if (acceptMessageSubmitted && selectedContract?.state === ContractState.Accepted && success) {
      handleSign(currentId!, counterpartyWalletUrl!);
    }
  }, [acceptMessageSubmitted, success, selectedContract]);

  useEffect(() => {
    if (success && selectedContract?.state === ContractState.Broadcast) {
      const txID = Transaction.fromHex(selectedContract.dlcTransactions.fund).getId();
      navigate('/tx-status', {
        state: {
          txid: txID,
          currency: 'BTC',
          error: '',
          browserTx: true,
        },
      });
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  }, [success, selectedContract]);

  useEffect(() => {
    if (error) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: error,
          browserTx: true,
        },
      });
    }
  }, [error]);

  return { handleContracts, handleOffer, handleAccept, handleReject, handleSign };
};

export default useBtcContracts;
