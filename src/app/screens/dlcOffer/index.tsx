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
import { getBtcPrivateKey } from '@secretkeylabs/xverse-core';
import AccountHeaderComponent from '@components/accountHeader';
import { fetchBtcWalletDataRequestAction } from '@stores/wallet/actions/actionCreators';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 16px;
  margin-right: 16px;
`;

const TestnetContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: props.theme.colors.background.elevation1,
  paddingTop: props.theme.spacing(3),
  paddingBottom: props.theme.spacing(3),
}));

const TestnetText = styled.h1((props) => ({
  ...props.theme.body_xs,
  textAlign: 'center',
  color: props.theme.colors.white['200'],
}));

const FunctionTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white['0'],
  marginTop: 16,
}));

const ContractIdContainer = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
  margin: props.theme.spacing(4),
  backgroundColor: props.theme.colors.background.elevation6,
  padding: props.theme.spacing(4),
  borderRadius: '50px',
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(8),
  paddingBottom: props.theme.spacing(8),
  borderBottom: `0.5px solid ${props.theme.colors.background.elevation3}`,
}));

const KeyContainer = styled.div({
  display: 'flex',
  flex: 1,
});

const ValueContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

const TitleText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['0'],
  textTransform: 'uppercase',
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['200'],
}));

const ButtonContainer = styled.div((props) => ({
  width: '100%',
  marginLeft: props.theme.spacing(5),
  marginRight: props.theme.spacing(5),
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

function DlcOfferRequest() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  const { offer } = useParams();
  const { dlcBtcAddress, btcPublicKey, seedPhrase, btcBalance, network, selectedAccount, stxBtcRate, btcFiatRate } =
    useSelector((state: StoreState) => state.walletState);

  const {
    processing,
    actionSuccess,
    error,
    currentId,
    signingRequested,
    acceptMessageSubmitted,
    selectedContract,
  } = useSelector((state: StoreState) => state.dlcState);

  const [canAccept, setCanAccept] = useState(false);

  const defaultCounterpartyWalletURL = 'http://localhost:8085';

  function handleOffer(message: string): void {
    dispatch(offerRequest(message));
  }

  async function handleAccept(): Promise<void> {
    const btcPrivateKey = await handlePrivateKey();

    if (selectedContract && currentId) {
      dispatch(acceptRequest(currentId, dlcBtcAddress, btcPublicKey, btcPrivateKey, network.type));
    }
  }

  function handleReject(): void {
    if (selectedContract && currentId) {
      dispatch(rejectRequest(currentId));
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

  async function writeAndSignAcceptMessage(): Promise<void> {
    const btcPrivateKey = await handlePrivateKey();
    if (currentId) {
      dispatch(signRequest(currentId, btcPrivateKey, network.type, defaultCounterpartyWalletURL));
    }
  }

  useEffect(() => {
    dispatch(fetchBtcWalletDataRequestAction(dlcBtcAddress, network.type, stxBtcRate, btcFiatRate));
  }, [dlcBtcAddress]);

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
    if (!selectedContract || !btcBalance) {
      return;
    }

    const btcCollateralAmount =
      selectedContract.contractInfo.totalCollateral - selectedContract.offerParams.collateral;
    const canAccept = Number(btcBalance) >= btcCollateralAmount;

    setCanAccept(canAccept);
  }, [selectedContract, btcBalance]);

  useEffect(() => {
    if (signingRequested && actionSuccess) {
      navigate(`/`);
    }
  }, [signingRequested, actionSuccess]);

  useEffect(() => {
    if (
      acceptMessageSubmitted &&
      actionSuccess &&
      selectedContract?.state === ContractState.Accepted
    ) {
      writeAndSignAcceptMessage();
    }
  }, [acceptMessageSubmitted, actionSuccess, selectedContract]);

  return (
    <>
      {network.type === 'Testnet' && (
        <TestnetContainer>
          <TestnetText>{'Testnet'}</TestnetText>
        </TestnetContainer>
      )}
      <AccountHeaderComponent />
      {selectedContract !== undefined && (
        <Container>
          <FunctionTitle>
            Lock BTC
          </FunctionTitle>
          <DappTitle>by DLC.Link</DappTitle>
          <ContractIdContainer>
            {truncateContractID(
              'id' in selectedContract ? selectedContract.id : selectedContract.temporaryContractId
            )}
          </ContractIdContainer>
          <RowContainer>
            <KeyContainer>
              <TitleText>State: </TitleText>
            </KeyContainer>
            <ValueContainer>
              <ValueText>{ContractState[selectedContract.state]}</ValueText>
            </ValueContainer>
          </RowContainer>
          <RowContainer>
            <KeyContainer>
              <TitleText>Available Amount:</TitleText>
            </KeyContainer>
            <ValueContainer>
              <ValueText>{btcBalance.toString()}</ValueText>
            </ValueContainer>
          </RowContainer>
          <RowContainer>
            <KeyContainer>
              <TitleText>Total Collateral:</TitleText>
            </KeyContainer>
            <ValueContainer>
              <ValueText>{selectedContract.contractInfo.totalCollateral}</ValueText>
            </ValueContainer>
          </RowContainer>
          <RowContainer>
            <KeyContainer>
              <TitleText>Offer Collateral: </TitleText>
            </KeyContainer>
            <ValueContainer>
              <ValueText>{selectedContract.offerParams.collateral}</ValueText>
            </ValueContainer>
          </RowContainer>
          <RowContainer>
            <KeyContainer>
              <TitleText>Maturity Bound: </TitleText>
            </KeyContainer>
            <ValueContainer>
              <ValueText>{selectedContract.contractMaturityBound}</ValueText>
            </ValueContainer>
          </RowContainer>
          <RowContainer>
            {ContractState[selectedContract.state] === ContractState[1] && (
              <>
                <ButtonContainer>
                  <ActionButton
                    text={'Confirm'}
                    disabled={!canAccept}
                    processing={processing}
                    onPress={handleAccept}
                  />
                </ButtonContainer>
                <ButtonContainer>
                  <ActionButton text={'Cancel'} transparent onPress={handleReject} />
                </ButtonContainer>
              </>
            )}
          </RowContainer>
        </Container>
      )}
    </>
  );
}

export default DlcOfferRequest;
