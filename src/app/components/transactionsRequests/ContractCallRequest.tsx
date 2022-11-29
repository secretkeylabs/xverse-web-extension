import SwapImage from '@assets/img/webInteractions/swapCall.svg';
import BNSImage from '@assets/img/webInteractions/bnsCall.svg';
import NFTImage from '@assets/img/webInteractions/nftCall.svg';
import ContractCall from '@assets/img/webInteractions/contractCall.svg';
import { ContractCallPayload } from '@stacks/connect';
import styled from 'styled-components';

const TopImage = styled.img((props) => ({
  marginTop: 40,
}));

const FunctionTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white['0'],
  marginTop: 16,
}));

const DappTitle = styled.h2((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white['400'],
  marginTop: 4,
}));

const headerImageMapping = {
  'purchase-asset': NFTImage,
  'buy-item': NFTImage,
  'buy-in-ustx': NFTImage,
  'name-preorder': BNSImage,
  'swap-x-for-y': SwapImage,
  'swap-helper': SwapImage,
};

interface ContractCallRequestProps {
  request: ContractCallPayload;
}

export default function ContractCallRequest(props: ContractCallRequestProps) {
  const { request } = props;
  const Illustration = headerImageMapping[request.functionName ?? ''];
  return (
    <>
      <TopImage src={Illustration || ContractCall} alt="contract-call" />
      <FunctionTitle>{request.functionName}</FunctionTitle>
      <DappTitle>{`Requested by ${request.appDetails?.name}`}</DappTitle>
    </>
  );
}
