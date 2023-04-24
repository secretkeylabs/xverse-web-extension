import styled from 'styled-components';
import { AnyContract } from 'dlc-lib';
import { useDispatch, useSelector } from 'react-redux';
import { select } from '@stores/dlc/actions/actionCreators';
import { useNavigate } from 'react-router-dom';
import { ContractState } from 'dlc-lib';
import { Transaction } from 'bitcoinjs-lib';
import { StoreState } from '@stores/index';
import { useEffect, useState } from 'react';
import ActionButton from '@components/button';
import { getBtcTxStatusUrl } from '@utils/helper';

const DlcTableRow = styled.tr((props) => ({
  height: 64,
}));

const DlcTableDataNarrow = styled.td((props) => ({
  width: '8%',
  ...props.theme.body_xs,
  alignContent: 'center',
  textAlign: 'left',
  paddingLeft: props.theme.spacing(2),
  color: props.theme.colors.white['200'],
}));

const DlcTableDataWide = styled.td((props) => ({
  width: '28%',
  ...props.theme.body_xs,
  alignContent: 'center',
  textAlign: 'left',
  paddingLeft: props.theme.spacing(2),
  color: props.theme.colors.white['200'],
}));

interface Props {
  contract: AnyContract;
}

export interface ContractSummary {
  id: string;
  collateral: number | undefined;
  fundingTx: string;
  state: ContractState;
}

const truncateContractID = (contractID: string) => {
  return `${contractID.slice(0, 4)}...${contractID.slice(-4)}`;
};

function DlcTableElement({ contract }: Props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { network } = useSelector((state: StoreState) => state.walletState);
  const [contractSummary, setContractSummary] = useState<ContractSummary>();

  const onClick = () => {
    dispatch(select(contract));
    navigate('/dlc-details');
  };

  const openNewTab = () => {
    window.open(contractSummary?.fundingTx, '_blank');
  };

  const generateContractSummary = (): void => {
    let btcTxStatusUrl: string | undefined;

    if (contract.state == ContractState.Broadcast) {
      const txId = Transaction.fromHex(contract.dlcTransactions.fund).getId();
      btcTxStatusUrl = getBtcTxStatusUrl(txId, network);
    }

    const contractSummary: ContractSummary = {
      id: truncateContractID('id' in contract ? contract.id : contract.temporaryContractId),
      collateral: 'acceptParams' in contract ? contract.acceptParams.collateral : undefined,
      fundingTx: btcTxStatusUrl ? btcTxStatusUrl : '',
      state: ContractState[contract.state],
    };
    setContractSummary(contractSummary);
  };

  useEffect(() => {
    generateContractSummary();
  }, [contract]);

  return (
    <DlcTableRow>
      <DlcTableDataWide>{contractSummary?.id}</DlcTableDataWide>
      <DlcTableDataWide>{contractSummary?.collateral}</DlcTableDataWide>
      <DlcTableDataWide>{contractSummary?.state}</DlcTableDataWide>
      <DlcTableDataNarrow>
        <ActionButton text="Info" transparent={true} onPress={() => onClick()}></ActionButton>
      </DlcTableDataNarrow>
      <DlcTableDataNarrow>
        {contractSummary?.fundingTx && (
          <ActionButton text="TX" transparent={true} onPress={() => openNewTab()}></ActionButton>
        )}
      </DlcTableDataNarrow>
    </DlcTableRow>
  );
}

export default DlcTableElement;
