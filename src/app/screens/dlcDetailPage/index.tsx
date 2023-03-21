import { FC, useEffect, useState } from 'react';
// import ContractDetailTemplate from '../../templates/ContractDetailTemplate';
import { useNavigate, useParams } from 'react-router-dom';
import { ContractState, getId, toAcceptMessage } from 'dlc-lib';
import {
  acceptRequest,
  actionError,
  offerRequest,
  rejectRequest,
  signRequest,
} from '@stores/dlc/actions/actionCreators';
import { StoreState } from '@stores/index';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import ActionButton from '@components/button';
import { getBtcPrivateKey, NetworkType } from '@secretkeylabs/xverse-core';
// import { bitcoin, testnet, regtest } from 'bitcoinjs-lib/src/networks';
// import { Network, payments, script, Transaction } from 'bitcoinjs-lib';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-top: 22px;
  margin-left: 16px;
  margin-right: 16px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const HeaderText = styled.h1((props) => ({
  textAlign: 'center',
  ...props.theme.body_bold_m,
  paddingRight: props.theme.spacing(10),
}));

const FunctionTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white['0'],
  marginTop: 16,
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: props.theme.spacing(20),
  marginTop: props.theme.spacing(12),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(8),
}));

const HeaderContainer = styled.div({
  display: 'flex',
  flex: 1,
});

const TitleContainer = styled.div({
  display: 'flex',
  flex: 1,
});

const ValueContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  textTransform: 'uppercase',
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['400'],
}));

const DappTitle = styled.h2((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white['400'],
  marginTop: 4,
}));

const truncateContractID = (contractID: string) => {
  return (
    contractID.substring(0, 4) +
    '...' +
    contractID.substring(contractID.length - 4, contractID.length)
  );
};

function DlcDetailPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  const { offer } = useParams();
  const { seedPhrase, btcBalance, network, selectedAccount } = useSelector(
    (state: StoreState) => state.walletState
  );

  // //Mainnet
  // const btcAddress = 'bc1qltwm9hrwghs7d2cg63976stmwcqzksgs2a7lxu';
  // const btcPublicKey = '03f1ee404420880871192056d938973c9bb29ce44c07c8826ebfb129b63c21f155'

  // Testnet
  const btcPublicKey = '0375ecef9b58e82f202c817ac2b466f4f15e04c4fc12a612ae68fb1664841faf3b';
  const btcAddress = 'tb1q30hfy82s4259ugwjy76aj5xnu55quqcu0rr3d6';

  const { processing, actionSuccess, error, contracts, currentId } = useSelector(
    (state: StoreState) => state.dlcState
  );

  let contract = contracts.find((c) => getId(c) === currentId);

  const [canAccept, setCanAccept] = useState(false);
  const [signingRequested, setSigningRequested] = useState(false);
  const [acceptMessageSubmitted, setAcceptMessageSubmitted] = useState(false);

  const defaultCounterpartyWalletURL = 'http://localhost:8085';

  function handleOffer(message: string): void {
    dispatch(offerRequest(message));
  }

  async function handleAccept(): Promise<void> {
    const btcPrivateKey = await handlePrivateKey();

    if (contract && currentId) {
      setAcceptMessageSubmitted(true);
      dispatch(acceptRequest(currentId, btcAddress, btcPublicKey, btcPrivateKey, network.type));
    }
  }

  function handleReject(): void {
    if (contract) {
      dispatch(rejectRequest(currentId as string));
      navigate('/');
    }
  }

  async function handlePrivateKey() {
    const btcPrivateKey = await getBtcPrivateKey({
      seedPhrase,
      index: BigInt(selectedAccount?.id ?? 0),
      network,
    });
    return btcPrivateKey;
  }

  async function signAcceptMessage(message: string): Promise<void> {
    const index = selectedAccount?.id ?? 0;
    const btcPrivateKey = await getBtcPrivateKey({
      seedPhrase,
      index: BigInt(index),
      network: network.type,
    });
    setSigningRequested(true);
    dispatch(signRequest(message, btcPrivateKey, network.type));
  }

  async function writeAcceptMessage(): Promise<void> {
    if (!contract || contract.state !== ContractState.Accepted) {
      return;
    }

    const acceptMessage = toAcceptMessage(contract);
    const stringifiedAcceptMessage = { acceptMessage: JSON.stringify(acceptMessage) };
    console.log('xverse-web-extension/dlcDetailPage/acceptMessage: ', acceptMessage);

    try {
      const response = await fetch(`${defaultCounterpartyWalletURL}/offer/accept`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
        mode: 'cors',
        body: JSON.stringify(stringifiedAcceptMessage),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const acceptMessageResponse = await response.json();
      console.log(
        'xverse-web-extension/dlcDetailPage/acceptMessageResponse: ',
        acceptMessageResponse
      );
      signAcceptMessage(JSON.stringify(acceptMessageResponse));
      setAcceptMessageSubmitted(false);
    } catch (error) {
      console.error(`Fetch Error: ${error}`);
    }
  }

  useEffect(() => {
    if (offer) {
      handleOffer(offer);
    }
  }, [offer]);

  useEffect(() => {
    if (error) {
      dispatch(actionError({ error: '' }));
    }
  }, [error]);

  useEffect(() => {
    if (processing) {
      console.log('Processing...');
    }
  }, [processing]);

  useEffect(() => {
    if (contract && btcBalance) {
      const btcCollateralAmount =
        contract.contractInfo.totalCollateral - contract.offerParams.collateral;
      const newCanAcceptValue = Number(btcBalance) >= btcCollateralAmount;
      setCanAccept(newCanAcceptValue);
    }
  }, [contract, btcBalance]);

  useEffect(() => {
    if (signingRequested && actionSuccess) {
      navigate(`/`);
    }
  }, [signingRequested, actionSuccess]);

  useEffect(() => {
    if (acceptMessageSubmitted && actionSuccess && contract?.state === ContractState.Accepted) {
      writeAcceptMessage();
    }
  }, [acceptMessageSubmitted, actionSuccess, contract]);

  useEffect(() => {
    console.log('xverse-web-extension/dlcDetailPage/btcAddress: ', btcAddress);
    console.log('xverse-web-extension/dlcDetailPage/btcPublicKey: ', btcPublicKey);
    console.log('xverse-web-extension/dlcDetailPage/btcPrivateKey: ', handlePrivateKey());
    console.log('xverse-web-extension/dlcDetailPage/btcNetwork: ', network.type);
  }, [btcAddress]);

  useEffect(() => {
    if (contract) {
      console.log('xverse-web-extension/dlcDetailPage/contract: ');
      console.log(contract);
    }
  }, [contract]);

  return (
    <>
      {contract !== undefined && (
        <Container>
          <Container>
            <FunctionTitle>Lock BTC</FunctionTitle>
            <DappTitle>Requested by DLC.Link</DappTitle>
          </Container>
          <Container>
            <HeaderContainer>
              <HeaderText>DLC Details</HeaderText>
            </HeaderContainer>
            <RowContainer>
              <TitleContainer>
                <TitleText>{'id' in contract ? 'ID' : 'Temporary ID'} </TitleText>
              </TitleContainer>
              <ValueContainer>
                <ValueText>
                  {'id' in contract
                    ? truncateContractID(contract.id)
                    : truncateContractID(contract.temporaryContractId)}
                </ValueText>
              </ValueContainer>
            </RowContainer>
            <RowContainer>
              <TitleContainer>
                <TitleText>State: </TitleText>
              </TitleContainer>
              <ValueContainer>
                <ValueText>{ContractState[contract.state]}</ValueText>
              </ValueContainer>
            </RowContainer>
            <RowContainer>
              <TitleContainer>
                <TitleText>Available Amount:</TitleText>
              </TitleContainer>
              <ValueContainer>
                <ValueText>{btcBalance.toString()}</ValueText>
              </ValueContainer>
            </RowContainer>
            <RowContainer>
              <TitleContainer>
                <TitleText>Total Collateral:</TitleText>
              </TitleContainer>
              <ValueContainer>
                <ValueText>{contract.contractInfo.totalCollateral}</ValueText>
              </ValueContainer>
            </RowContainer>
            <RowContainer>
              <TitleContainer>
                <TitleText>Offer Collateral: </TitleText>
              </TitleContainer>
              <ValueContainer>
                <ValueText>{contract.offerParams.collateral}</ValueText>
              </ValueContainer>
            </RowContainer>
            <RowContainer>
              <TitleContainer>
                <TitleText>Maturity Bound: </TitleText>
              </TitleContainer>
              <ValueContainer>
                <ValueText>{contract.contractMaturityBound}</ValueText>
              </ValueContainer>
            </RowContainer>
          </Container>
          <ButtonContainer>
            <ActionButton
              text={t('CONFIRM')}
              disabled={!canAccept}
              processing={processing}
              onPress={handleAccept}
            />
            <ActionButton text={t('CANCEL')} transparent onPress={handleReject} />
          </ButtonContainer>
        </Container>
      )}
    </>
  );
}

export default DlcDetailPage;
