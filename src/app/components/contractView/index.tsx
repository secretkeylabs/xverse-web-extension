import { FC, useEffect, useState } from 'react';
import { ContractState } from 'dlc-lib';
import { AnyContract } from 'dlc-lib';
import { Transaction } from 'bitcoinjs-lib';

export type ContractViewProps = {
  contract: AnyContract;
  acceptContract: () => void;
  rejectContract: () => void;
  cancel: () => void;
  availableAmount: number;
};

class FormattedContract {
  state: string;
  id: string;
  maturityDate: string;
  feeRate: number;
  collateral: number;

  constructor(
    state: string,
    id: string,
    maturityDate: string,
    feeRate: number,
    collateral: number
  ) {
    this.state = state;
    this.id = id;
    this.maturityDate = maturityDate;
    this.feeRate = feeRate;
    this.collateral = collateral;
  }
}

function openNewTab(explorerUrl: any) {
  window.open(explorerUrl, '_blank');
}

function truncateContractID(contractID: string) {
  return (
    contractID.substring(0, 4) +
    '...' +
    contractID.substring(contractID.length - 4, contractID.length)
  );
}

function formatContract(contract: AnyContract) {
  const state = ContractState[contract.state];
  const id =
    'id' in contract
      ? truncateContractID(contract.id)
      : truncateContractID(contract.temporaryContractId);
  const maturityDate = new Date(contract.contractMaturityBound * 1000).toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const feeRate = contract.feeRatePerVByte;
  const collateral = contract.contractInfo.totalCollateral - contract.offerParams.collateral;
  const formattedContract = new FormattedContract(state, id, maturityDate, feeRate, collateral);

  return formattedContract;
}

function getExplorerUrlIfFundTxExists(contract: AnyContract) {
  let explorerUrl = '';
  if (contract.state == ContractState.Broadcast) {
    const fundTxId = Transaction.fromHex(contract.dlcTransactions.fund).getId();
    explorerUrl = `http://stx-btc1.dlc.link:8001/tx/${fundTxId}`;
  }
  return explorerUrl;
}

function calculateCanAccept(availableAmount: number, totalCollateral: number, collateral: number) {
  const canAccept = availableAmount >= totalCollateral - collateral;
  return canAccept;
}

export const ContractView: FC<ContractViewProps> = (props: ContractViewProps) => {
  const [contract, setContract] = useState(props.contract);
  const [isLoading, setLoading] = useState(true);
  const [isProposal, setIsProposal] = useState(false);
  const [canAccept, setCanAccept] = useState(false);
  const [formattedContract, setFormattedContract] = useState<FormattedContract | undefined>(
    undefined
  );
  const [explorerUrl, setExplorerUrl] = useState('');

  useEffect(() => {
    setFormattedContract(formatContract(contract));
    setExplorerUrl(getExplorerUrlIfFundTxExists(contract));
    setIsProposal(contract.state === ContractState.Offered);
    setCanAccept(
      calculateCanAccept(
        props.availableAmount,
        contract.contractInfo.totalCollateral,
        contract.offerParams.collateral
      )
    );
    setLoading(false);
  }, [contract, setContract]);

  useEffect(() => {
    console.log('Accept Parameters:');
    console.log('Available Amount:', props.availableAmount);
    console.log('Total Collateral:', contract.contractInfo.totalCollateral);
    console.log('Offer Collateral:', contract.offerParams.collateral);
    console.log('Can Accept?', canAccept);
  }, [props.availableAmount, contract]);

  const handleAccept = (): void => {
    props.acceptContract();
  };

  const handleReject = (): void => {
    props.rejectContract();
  };

  const handleCancel = (): void => {
    if (props.cancel) props.cancel();
  };

  return (
    <div>
      {!isLoading && formattedContract && (
        <table>
          <tr>
            <td>CONTRACT ID:</td>
            <td>{formattedContract.id}</td>
          </tr>
          <tr>
            <td>STATE:</td>
            <td>{formattedContract.state}</td>
          </tr>
          <tr>
            <td>MATURITY DATE:</td>
            <td>{formattedContract.maturityDate}</td>
          </tr>
          <tr>
            <td>FEE RATE:</td>
            <td>{formattedContract.feeRate}</td>
          </tr>
          <tr>
            <td>COLLATERAL:</td>
            <td>{formattedContract.collateral}</td>
          </tr>
          {explorerUrl !== '' && (
            <tr>
              <td>FUNDING TX:</td>
              <td>
                <button onClick={() => openNewTab(explorerUrl)}>Click</button>
              </td>
            </tr>
          )}
        </table>
      )}
      <div>
        {isProposal && (
          <>
            <button disabled={!canAccept} onClick={handleAccept}>
              Accept
            </button>
            <button onClick={handleReject}>Reject</button>
          </>
        )}
        <button onClick={handleCancel}>Back</button>
      </div>
    </div>
  );
};
