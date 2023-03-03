import { FC, useEffect, useState } from 'react';
// import ContractDetailTemplate from '../../templates/ContractDetailTemplate';
import { useNavigate, useParams } from 'react-router-dom';
import { ContractState, getId, toAcceptMessage } from 'dlc-lib';
import {
  acceptRequest,
  actionError,
  rejectRequest,
  signRequest,
} from '@stores/dlc/actions/actionCreators';
import { StoreState } from '@stores/index';
import { useSelector, useDispatch } from 'react-redux';
import { DlcView } from '@components/dlcView';

const DlcDetailPage: FC = () => {
  const dispatch = useDispatch();
  const { processing, actionSuccess, error, contracts, selectedContract } = useSelector(
    (state: StoreState) => state.dlcState
  );
  const { contractId } = useParams();
  const [signingRequested, setSigningRequested] = useState(false);
  const [acceptMessageSubmitted, setAcceptMessageSubmitted] = useState(false);
  const [displayError, setDisplayError] = useState(true);
  let contract = contracts.find((c) => getId(c) === contractId);
  const navigate = useNavigate();
  const [availableAmount, setAvailableAmount] = useState(0);
  const defaultCounterpartyWalletURL = 'https://dev-oracle.dlc.link/wallet';

  useEffect(() => {
    if (displayError && error) {
      console.log(error, 'error');
      setDisplayError(false);
    }
    dispatch(actionError({ error: '' }));
  }, [displayError, error, dispatch]);

  useEffect(() => {
    if (processing) {
      console.log('Loading...', 'warning');
    }
  }, [processing]);

  useEffect(() => {
    if (contractId && contract?.state != ContractState.Accepted)
      contract = contracts.find((c) => getId(c) === contractId);
    console.log('Current Contract: ', selectedContract);
  }, [contractId]);

  useEffect(() => {
    const { btcBalance } = useSelector((state: StoreState) => state.walletState);
    async function getBalance() {
      setAvailableAmount(btcBalance.toNumber());
    }
    getBalance();
  }, []);

  useEffect(() => {
    if (signingRequested && actionSuccess) {
      navigate(`/`);
    }
    if (acceptMessageSubmitted && actionSuccess && contract?.state === ContractState.Accepted) {
      writeAcceptMessage();
    }
  });

  const handleAccept = (): void => {
    // This action will set the contract's status to Accepted
    // It will also update the contractID from temp to id.
    if (contract) {
      setAcceptMessageSubmitted(true);
      dispatch(acceptRequest(getId(contract)));
    }
  };

  const handleReject = (): void => {
    if (contract) {
      dispatch(rejectRequest(getId(contract)));
      navigate('/');
    }
  };

  const handleCancel = (): void => {
    navigate('/');
  };

  const signAcceptMessage = (message: string): void => {
    setSigningRequested(true);
    dispatch(signRequest(message));
  };

  async function writeAcceptMessage() {
    console.log('writeAcceptMessage:');
    if (contract?.state === ContractState.Accepted) {
      const acceptMessage = toAcceptMessage(contract);
      const formattedMessage = {
        acceptMessage: JSON.stringify(acceptMessage).toString(),
      };
      try {
        await fetch(`${defaultCounterpartyWalletURL}/offer/accept`, {
          headers: { 'Content-Type': 'application/json' },
          method: 'PUT',
          mode: 'cors',
          body: JSON.stringify(formattedMessage),
        })
          .then((x) => x.json())
          .then((res) => {
            console.log(res);
            signAcceptMessage(JSON.stringify(res));
            setAcceptMessageSubmitted(false);
          });
      } catch (error) {
        console.error(`Fetch Error: ${error}`);
      }
    }
  }

  return (
    <>
      {contract !== undefined && (
        <DlcView
          contract={contract}
          acceptContract={handleAccept}
          rejectContract={handleReject}
          cancel={handleCancel}
          availableAmount={availableAmount}
        />
      )}
    </>
  );
};

export default DlcDetailPage;
