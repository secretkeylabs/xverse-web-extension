import ActionButton from '@components/button';
import styled from 'styled-components';
import useWalletSelector from '@hooks/useWalletSelector';
import { ExecuteBrc20TransferState } from '@utils/brc20';
import { StyledP, StyledHeading, VerticalStackButtonContainer } from '@components/styledCommon';
import { useBrc20TransferExecute } from '@secretkeylabs/xverse-core';
import { useLocation, useNavigate } from 'react-router-dom';
// import { useState } from 'react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing(8)}px;
  padding-top: ${(props) => props.theme.spacing(68)}px;
  position: relative;
`;

const CenterAlignContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BottomFixedContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: ${(props) => props.theme.spacing(8)}px;
  padding-bottom: 0;
  margin-bottom: ${(props) => props.theme.spacing(32)}px;
`;

const StatusLarge = styled.div`
  min-width: 88px;
  min-height: 88px;
  padding: 22px;
  margin-bottom: 8px;
`;

const Heading = styled(StyledHeading)`
  margin-bottom: 6px;
`;

export function ExecuteBrc20Transaction() {
  const { selectedAccount, btcAddress, network, seedPhrase } = useWalletSelector();
  const navigate = useNavigate();
  const { recipientAddress, estimateFeesParams, estimatedFees, token }: ExecuteBrc20TransferState =
    useLocation().state;

  const { progress, complete, executeTransfer, transferTransactionId, errorCode } =
    useBrc20TransferExecute({
      ...estimateFeesParams,
      seedPhrase,
      accountIndex: selectedAccount?.id ?? 0,
      changeAddress: btcAddress,
      recipientAddress,
      network: network.type,
    });

  if (errorCode) {
    console.error(errorCode);
  } else {
    console.log(transferTransactionId);
    console.log(progress);
    console.log(complete);
  }

  const handleClickClose = () => {};
  const handleClickSeeTransaction = () => {
    navigate(`/coinDashboard/${token?.ticker}`);
  };

  return (
    <Container>
      <CenterAlignContainer>
        <StatusLarge>animation here</StatusLarge>
        <Heading typography="headline_xs">Broadcasting your transaction</Heading>
        <StyledP typography="body_medium_m" color="white_200">
          Do not close your wallet
        </StyledP>
      </CenterAlignContainer>
      <BottomFixedContainer>
        <VerticalStackButtonContainer>
          <ActionButton text="Close" onPress={handleClickClose} />
          {!errorCode && (
            <ActionButton text="See transaction" onPress={handleClickSeeTransaction} transparent />
          )}
        </VerticalStackButtonContainer>
      </BottomFixedContainer>
    </Container>
  );
}
export default ExecuteBrc20Transaction;
