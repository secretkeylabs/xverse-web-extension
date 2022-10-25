import SwapImage from '@assets/img/swap-illustration.svg';
import BNSImage from '@assets/img/bns-illustration.svg';
import NFTImage from '@assets/img/nft-illustration.svg';
import styled from 'styled-components';
import ConfirmTransaction from '@components/confirmTransactionScreen';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import PostCondition from '@components/postCondition';

const headerImageMapping = {
  'purchase-asset': NFTImage,
  'buy-item': NFTImage,
  'buy-in-ustx': NFTImage,
  'name-preorder': BNSImage,
  'swap-x-for-y': SwapImage,
  'swap-helper': SwapImage,
};

const MainContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  height: '100%',
}));

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

function TransactionRequest() {
  const appName = 'gamma.io';
  const functionName = 'purchase-asset';

  const confirmCallback = () => {};
  const cancelCallback = () => {};

  const { search } = useLocation();
  const params = new URLSearchParams(search);

  return (
    <ConfirmTransaction onConfirm={confirmCallback} onCancel={cancelCallback}>
      <MainContainer>
        <TopImage src={headerImageMapping['buy-in-ustx']} alt="" />
        <FunctionTitle>{functionName}</FunctionTitle>
        <DappTitle>{`Requested by ${appName}`} </DappTitle>
        {/* <PostCondition postCondition={} showMore={false} /> */}
      </MainContainer>
    </ConfirmTransaction>
  );
}

export default TransactionRequest;
