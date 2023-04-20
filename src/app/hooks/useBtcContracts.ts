import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { StoreState } from '@stores/index';

import { ContractUpdater, DlcManager, DlcSigner } from 'dlc-lib';

import LocalRepository from 'app/dlcClasses/persistence/localRepository';
import DlcBitcoinBlockchain from 'app/dlcClasses/DlcBlockchain';
import DlcService from 'app/dlcClasses/DlcService';

import { OfferRequest } from '@stores/dlc/actions/types';

import {
  contractSuccess,
  contractError,
  actionSuccess,
  actionError,
} from '@stores/dlc/actions/actionCreators';

import useBtcClient from './useBtcClient';

import { getBtcNativeSegwitPrivateKey } from '@secretkeylabs/xverse-core';

const useBtcContracts = () => {
  const btcClient = useBtcClient();
  const dispatch = useDispatch();

  const dlcStorage = new LocalRepository();
  const blockchain = new DlcBitcoinBlockchain(btcClient);
  const dlcSigner = new DlcSigner();
  const contractUpdater = new ContractUpdater(dlcSigner, blockchain);
  const dlcManager = new DlcManager(contractUpdater, dlcStorage);
  const dlcService = new DlcService(dlcManager, dlcStorage);

  const {
    dlcBtcAddress,
    dlcBtcPublicKey,
    seedPhrase,
    network,
    selectedAccount,
  } = useSelector((state: StoreState) => state.walletState);

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

  async function handleOffer(offer: string) {
    try {
      const contract = await dlcService.processContractOffer(offer);
      dispatch(actionSuccess(contract));
    } catch (error) {
      dispatch(actionError({ error: `HandleOffer Effect Failure: ${error}` }));
    }
  }

  async function handleAccept(contractID: string) {
    try {
      const contract = await dlcService.acceptContract(
        contractID,
        dlcBtcAddress,
        dlcBtcPublicKey,
        seedPhrase,
        network.type
      );
      dispatch(actionSuccess(contract));
    } catch (error) {
      dispatch(actionError({ error: `HandleAccept Effect Failure: ${error}` }));
    }
  }

  async function handleReject(contractID: string) {
    try {
      const contract = await dlcService.rejectContract(contractID);
      dispatch(actionSuccess(contract));
    } catch (error) {
      dispatch(actionError({ error: `HandleReject Effect Failure: ${error}` }));
    }
  }

  async function handleSign(contractID: string, counterpartyWalletURL: string) {
    const dlcBtcPrivateKey = await deriveBtcNativeSegwitPrivateKey();
    try {
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

  return { handleContracts, handleOffer, handleAccept, handleReject, handleSign };
};

export default useBtcContracts;
