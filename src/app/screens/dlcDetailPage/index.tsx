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
import { bitcoin, testnet, regtest } from 'bitcoinjs-lib/src/networks';
import { getBtcPrivateKey } from '@secretkeylabs/xverse-core';

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
  const { btcAddress, btcPublicKey, seedPhrase, btcBalance, network, selectedAccount } =
    useSelector((state: StoreState) => state.walletState);
  const { processing, actionSuccess, error, contracts, currentId } = useSelector(
    (state: StoreState) => state.dlcState
  );

  let contract = contracts.find((c) => getId(c) === currentId);

  const [canAccept, setCanAccept] = useState(false);
  const [signingRequested, setSigningRequested] = useState(false);
  const [acceptMessageSubmitted, setAcceptMessageSubmitted] = useState(false);

  const defaultCounterpartyWalletURL = 'http://localhost:8085';

  const handleOffer = (message: string): void => {
    dispatch(offerRequest(message));
  };

  useEffect(() => {
    handleOffer(offer as string);
  }, []);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
    dispatch(actionError({ error: '' }));
  }, [error, dispatch]);

  useEffect(() => {
    if (processing) {
      console.log('Processing...');
    }
  }, [processing]);

  useEffect(() => {
    if (contract && btcBalance) {
      console.log('btcBalance: ', Number(btcBalance));
      console.log(
        'btcCollateral: ',
        contract.contractInfo.totalCollateral - contract.offerParams.collateral
      );
      const newCanAcceptValue =
        Number(btcBalance) >=
        contract.contractInfo.totalCollateral - contract.offerParams.collateral;
      setCanAccept(newCanAcceptValue);
      console.log('Can accept offer: ', canAccept);
    }
  }, [contract, btcBalance]);

  useEffect(() => {
    async function handlePrivateKey() {
      const privateKey = await getBtcPrivateKey({
        seedPhrase,
        index: BigInt(selectedAccount?.id ?? 0),
        network,
      });
      return privateKey;
    }
    console.log('btcAddress: ', btcAddress);
    console.log('btcPublicKey: ', btcPublicKey);
    console.log('btcPrivateKey: ', handlePrivateKey());
    console.log('btcNetwork: ', network.type);
  }, [btcAddress]);

  async function handleAccept(): Promise<void> {
    const index = selectedAccount?.id ?? 0;
    const btcPrivateKey = await getBtcPrivateKey({ seedPhrase, index: BigInt(index), network });

    if (contract) {
      setAcceptMessageSubmitted(true);
      dispatch(
        acceptRequest(currentId as string, btcAddress, btcPublicKey, btcPrivateKey, network.type)
      );
    }
  }

  function handleReject(): void {
    if (contract) {
      dispatch(rejectRequest(currentId as string));
      navigate('/');
    }
  }

  useEffect(() => {
    if (signingRequested && actionSuccess) {
      navigate(`/`);
    }
    if (acceptMessageSubmitted && actionSuccess && contract?.state === ContractState.Accepted) {
      writeAcceptMessage();
    }
  }, [signingRequested, actionSuccess, acceptMessageSubmitted, contract]);

  useEffect(() => {
    console.log('Current Contract: ');
    console.log(contract);
  }, [contract]);

  async function signAcceptMessage(message: string): Promise<void> {
    const index = selectedAccount?.id ?? 0;
    const btcPrivateKey = await getBtcPrivateKey({ seedPhrase, index: BigInt(index), network });
    setSigningRequested(true);
    dispatch(signRequest(message, btcPrivateKey, network.type));
  }

  async function writeAcceptMessage(): Promise<void> {
    if (!contract || contract.state !== ContractState.Accepted) {
      return;
    }

    const acceptMessage = toAcceptMessage(contract);
    const formattedMessage = { acceptMessage: JSON.stringify(acceptMessage) };

    console.log('formattedMessage: ', formattedMessage);
    try {
      const response = await fetch(`${defaultCounterpartyWalletURL}/offer/accept`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
        mode: 'cors',
        body: JSON.stringify(formattedMessage),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const acceptMessage = await response.json();
      console.log('Accept Message:', acceptMessage);
      signAcceptMessage(JSON.stringify(acceptMessage));
      setAcceptMessageSubmitted(false);
    } catch (error) {
      console.error(`Fetch Error: ${error}`);
    }
  }

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
