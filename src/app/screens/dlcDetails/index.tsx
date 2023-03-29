import { FC, useEffect, useState } from 'react';
// import ContractDetailTemplate from '../../templates/ContractDetailTemplate';
import { useNavigate } from 'react-router-dom';
import { ContractState } from 'dlc-lib';
import {
  acceptRequest,
  actionError,
  rejectRequest,
  signRequest,
} from '@stores/dlc/actions/actionCreators';
import { StoreState } from '@stores/index';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import ActionButton from '@components/button';
import AccountHeaderComponent from '@components/accountHeader';
import BalanceCard from '@screens/home/balanceCard';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import { getBtcNativeSegwitPrivateKey } from '@secretkeylabs/xverse-core';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 16px;
  margin-right: 16px;
`;

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

const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(11),
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

const truncateContractID = (contractID: string) => {
  return `${contractID.slice(0, 4)}...${contractID.slice(-4)}`;
};

function DlcDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'DLC_SCREEN' });


  const { dlcBtcAddress, dlcBtcPublicKey, seedPhrase, btcBalance, network, selectedAccount } =
    useSelector((state: StoreState) => state.walletState);

  const { isLoading: loadingBtcWalletData, refetch, isRefetching: refetchingBtcWalletData} =
    useBtcWalletData();

  const {
    processing,
    actionSuccess,
    error,
    selectedContract,
    currentId,
    signingRequested,
    acceptMessageSubmitted,
  } = useSelector((state: StoreState) => state.dlcState);

  const [canAccept, setCanAccept] = useState(false);
  const [contractMaturityBound, setContractMaturityBound] = useState<string>();


  const defaultCounterpartyWalletURL = 'http://localhost:8085';

  async function handleAccept(): Promise<void> {
    const btcPrivateKey = await handlePrivateKey();

    if (selectedContract && currentId) {
      dispatch(
        acceptRequest(currentId, dlcBtcAddress, dlcBtcPublicKey, btcPrivateKey, network.type)
      );
    }
  }

  function handleReject(): void {
    if (selectedContract) {
      dispatch(rejectRequest(currentId as string));
      navigate('/');
    }
  }

  function handleBack(): void {
    navigate('/dlc-list');
  }

  async function handlePrivateKey() {
    const btcPrivateKey = await getBtcNativeSegwitPrivateKey({
      seedPhrase,
      index: BigInt(selectedAccount?.id ?? 0),
      network,
    });
    return btcPrivateKey;
  }

  async function writeAndSignAcceptMessage(): Promise<void> {
    const btcPrivateKey = await handlePrivateKey();
    dispatch(
      signRequest(currentId as string, btcPrivateKey, network.type, defaultCounterpartyWalletURL)
    );
  }

  useEffect(() => {
    refetch();
  }, []);

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

    const contractMaturityBound = new Date(selectedContract.contractMaturityBound).toLocaleString();
    setContractMaturityBound(contractMaturityBound);

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
      <AccountHeaderComponent />
      {selectedContract !== undefined && (
        <Container>
          <BalanceCard
            isLoading={
              loadingBtcWalletData ||
              refetchingBtcWalletData
            }
          />
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
              <ValueText>{btcBalance.toString()} sats</ValueText>
            </ValueContainer>
          </RowContainer>
          <RowContainer>
            <KeyContainer>
              <TitleText>Total Collateral:</TitleText>
            </KeyContainer>
            <ValueContainer>
              <ValueText>{selectedContract.contractInfo.totalCollateral} sats</ValueText>
            </ValueContainer>
          </RowContainer>
          <RowContainer>
            <KeyContainer>
              <TitleText>Offer Collateral: </TitleText>
            </KeyContainer>
            <ValueContainer>
              <ValueText>{selectedContract.offerParams.collateral} sats</ValueText>
            </ValueContainer>
          </RowContainer>
          <RowContainer>
            <KeyContainer>
              <TitleText>Maturity Bound: </TitleText>
            </KeyContainer>
            <ValueContainer>
              <ValueText>{contractMaturityBound}</ValueText>
            </ValueContainer>
          </RowContainer>
          <RowButtonContainer>
            {ContractState[selectedContract.state] === ContractState[1] && (
              <>
                <ButtonContainer>
                  <ActionButton
                    text={t('ACCEPT')}
                    disabled={!canAccept}
                    processing={processing}
                    onPress={handleAccept}
                  />
                </ButtonContainer>
                <ButtonContainer>
                  <ActionButton text={t('REJECT')} transparent onPress={handleReject} />
                </ButtonContainer>
              </>
            )}
            <ButtonContainer>
              <ActionButton text={t('BACK')} onPress={handleBack} />
            </ButtonContainer>
          </RowButtonContainer>
        </Container>
      )}
    </>
  );
}

export default DlcDetails;
