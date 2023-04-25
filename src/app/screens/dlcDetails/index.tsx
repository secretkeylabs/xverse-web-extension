import { StoreState } from '@stores/index';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components';
import ActionButton from '@components/button';
import AccountHeaderComponent from '@components/accountHeader';
import TokenImage from '@components/tokenImage';

import { satsToBtc } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import { ContractState } from 'dlc-lib';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: auto;
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
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'DLC_SCREEN' });

  const [contractMaturityBound, setContractMaturityBound] = useState<string>();

  const { refetch } = useBtcWalletData();

  const { selectedContract } = useSelector(
    (state: StoreState) => state.dlcState
  );

  function formatAndSetContractMaturityBound(contractMaturityBound: number): void {
    const formattedContractMaturityBound = new Date(contractMaturityBound * 1000).toLocaleString();
    setContractMaturityBound(formattedContractMaturityBound);
  }

  function handleBack(): void {
    navigate('/dlc-list');
  }

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (!selectedContract) {
      return;
    }

    formatAndSetContractMaturityBound(selectedContract.contractMaturityBound);
  }, [selectedContract]);

  return (
    <>
      <AccountHeaderComponent />
      {selectedContract !== undefined && (
        <Container>
          <FunctionTitle>Bitcoin Contract</FunctionTitle>
          <DappTitle>by DLC.Link</DappTitle>
          <TitleText>Amount</TitleText>
          <AmountContainer>
            <AmountText>
              {satsToBtc(new BigNumber(selectedContract.contractInfo.totalCollateral)).toString()}{' '}
              BTC
            </AmountText>
            <TokenImageContainer>
              <TokenImage token="BTC" loading={false} />
            </TokenImageContainer>
          </AmountContainer>
          <RowContainer>
            <KeyText>Contract State: </KeyText>
            <ValueText>{ContractState[selectedContract.state]}</ValueText>
          </RowContainer>
          <RowContainer>
            <KeyText>Contract Expires: </KeyText>
            <ValueText>{contractMaturityBound}</ValueText>
          </RowContainer>
          <RowButtonContainer>
            <ButtonContainer>
              <ActionButton text={t('BACK')} onPress={() => handleBack()} />
            </ButtonContainer>
          </RowButtonContainer>
        </Container>
      )}
    </>
  );
}

export default DlcOfferRequest;
