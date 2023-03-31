import { useEffect, useState } from 'react';
// import ContractDetailTemplate from '../../templates/ContractDetailTemplate';
import { useNavigate, useParams } from 'react-router-dom';
import { ContractState } from 'dlc-lib';
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
import {
  getBtcNativeSegwitPrivateKey,
  satsToBtc,
  getBtcFiatEquivalent,
} from '@secretkeylabs/xverse-core';
import AccountHeaderComponent from '@components/accountHeader';
import TokenImage from '@components/tokenImage';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 16px;
  margin-right: 16px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const FunctionTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white['0'],
  marginTop: props.theme.spacing(8),
}));

const DappTitle = styled.h2((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white['400'],
  marginTop: props.theme.spacing(4),
}));

const AmountContainer = styled.div((props) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: props.theme.colors.white['0'],
  marginTop: props.theme.spacing(8),
  paddingTop: props.theme.spacing(4),
  paddingBottom: props.theme.spacing(4),
  paddingLeft: props.theme.spacing(16),
  paddingRight: props.theme.spacing(16),
  border: 'solid 1px',
  borderRadius: '15px',
  borderColor: props.theme.colors.background.elevation6,
}));

const TokenImageContainer = styled.div((props) => ({
  paddingLeft: props.theme.spacing(8),
  borderLeft: 'solid 1px',
  borderColor: props.theme.colors.background.elevation6,
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: props.theme.spacing(8),
  paddingBottom: props.theme.spacing(8),
  borderBottom: `0.5px solid ${props.theme.colors.background.elevation3}`,
}));

const AmountText = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  textAlign: 'center',
}));

const CurrencyText = styled.h1((props) => ({
  ...props.theme.body_xs,
  marginTop: props.theme.spacing(8),
  marginBottom: props.theme.spacing(8),
  marginLeft: props.theme.spacing(16),
  color: props.theme.colors.white['200'],
}));

const AlertText = styled.i((props) => ({
  textAlign: 'justify',
  ...props.theme.body_xs,
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
  color: props.theme.colors.feedback.caution,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  marginTop: props.theme.spacing(8),
  color: props.theme.colors.white[0],
}));

const KeyText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['200'],
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['200'],
}));

const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(11),
}));

const ButtonContainer = styled.div((props) => ({
  width: '100%',
  marginLeft: props.theme.spacing(5),
  marginRight: props.theme.spacing(5),
}));

function DlcOfferRequest() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'DLC_SCREEN' });
  const { offer, counterpartyWalletUrl } = useParams();
  // counterpartyWalletUrl param is disabled for demo purposes
  // const [currentCounterpartyWalletUrl, setCurrentCounterpartyWalletUrl] =
  //   useState<string>();
  const {
    dlcBtcAddress,
    dlcBtcPublicKey,
    seedPhrase,
    btcBalance,
    network,
    selectedAccount,
    btcFiatRate,
  } = useSelector((state: StoreState) => state.walletState);

  const {
    processing,
    actionSuccess,
    error,
    currentId,
    signingRequested,
    acceptMessageSubmitted,
    selectedContract,
  } = useSelector((state: StoreState) => state.dlcState);

  const [contractMaturityBound, setContractMaturityBound] = useState<string>();
  const [usdEquivalent, setUsdEquivalent] = useState<string>();
  const [canAccept, setCanAccept] = useState(false);
  
  async function handlePrivateKey() {
    const btcPrivateKey = await getBtcNativeSegwitPrivateKey({
      seedPhrase,
      index: BigInt(selectedAccount?.id ?? 0),
      network,
    });
    return btcPrivateKey;
  }

  function handleOffer(message: string): void {
    dispatch(offerRequest(message));
  }

  async function handleAccept(): Promise<void> {
    const btcPrivateKey = await handlePrivateKey();

    if (selectedContract && currentId) {
      dispatch(
        acceptRequest(currentId, dlcBtcAddress, dlcBtcPublicKey, btcPrivateKey, network.type)
      );
    }
  }

  function handleReject(): void {
    if (selectedContract && currentId) {
      dispatch(rejectRequest(currentId));
      navigate('/');
    }
  }

  async function writeAndSignAcceptMessage(): Promise<void> {
    const btcPrivateKey = await handlePrivateKey();
    if (currentId) {
      dispatch(signRequest(currentId, btcPrivateKey, network.type, counterpartyWalletUrl!));
    }
  }

  useEffect(() => {
    if (offer) {
      handleOffer(offer);
    }
  }, [offer]);

  useEffect(() => {
    if (!selectedContract || !btcBalance) {
      return;
    }
    const updatedContractMaturityBound = new Date(
      selectedContract.contractMaturityBound
    ).toLocaleString();
    setContractMaturityBound(updatedContractMaturityBound);

    const satsAmount = new BigNumber(selectedContract.contractInfo.totalCollateral);
    const updatedUsdEquivalent = getBtcFiatEquivalent(satsAmount, btcFiatRate)
      .toFixed(2)
      .toString();
    setUsdEquivalent(updatedUsdEquivalent);

    const btcCollateralAmount =
      selectedContract.contractInfo.totalCollateral - selectedContract.offerParams.collateral;
    const updatedCanAccept = Number(btcBalance) >= btcCollateralAmount;
    setCanAccept(updatedCanAccept);
  }, [selectedContract, btcBalance]);

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
    if (signingRequested && actionSuccess) {
      navigate('/');
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
          <FunctionTitle>Lock BTC</FunctionTitle>
          <DappTitle>by DLC.Link</DappTitle>
          <TitleText>Amount</TitleText>
          <AmountContainer>
            <AmountText>
              {satsToBtc(new BigNumber(selectedContract.contractInfo.totalCollateral)).toString()}
              {' '}
              BTC
            </AmountText>
            <TokenImageContainer>
              <TokenImage token="BTC" loading={false} />
            </TokenImageContainer>
          </AmountContainer>
          <CurrencyText>
            <NumericFormat
              value={usdEquivalent}
              displayType="text"
              thousandSeparator
              renderText={(value) => `~ $ ${value} USD`}
            />
          </CurrencyText>
          <RowContainer>
            <KeyText>Contract Expires: </KeyText>
            <ValueText>{contractMaturityBound}</ValueText>
          </RowContainer>
          <AlertText>
            By signing the contract YOU AGREE TO LOCK YOUR BITCOIN with the Other Party into a
            contract where it will remain until a triggering event will release it.
          </AlertText>
          <RowButtonContainer>
            {ContractState[selectedContract.state] === ContractState[1] && (
              <>
                <ButtonContainer>
                  <ActionButton
                    text={t('ACCEPT')}
                    disabled={!canAccept}
                    processing={processing}
                    onPress={() => handleAccept()}
                  />
                </ButtonContainer>
                <ButtonContainer>
                  <ActionButton text={t('REJECT')} transparent onPress={() => handleReject()} />
                </ButtonContainer>
              </>
            )}
          </RowButtonContainer>
        </Container>
      )}
    </>
  );
}

export default DlcOfferRequest;
