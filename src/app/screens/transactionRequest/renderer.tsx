import React, { createContext, ReactNode, useContext } from 'react';
import {
  addressToString,
  ClarityType,
  ClarityValue,
  cvToJSON,
  cvToString,
  PostCondition,
  PostConditionType,
  SomeCV,
} from '@stacks/transactions';
import SwapImage from '@assets/img/webInteractions/swapCall.svg';
import BNSImage from '@assets/img/webInteractions/bnsCall.svg';
import NFTImage from '@assets/img/webInteractions/nftCall.svg';
import ContractCall from '@assets/img/webInteractions/contractCall.svg';
import { Args, Coin, ContractFunction } from '../../common/utils';
import FtPostConditionCard from '../../components/ftPostConditionCard';
import NftPostConditionCard from '../../components/nftPostConditionCard';
import StxPostConditionCard from '../../components/stxPostConditionCard';

import { DappInfoContext } from '../../navigation/browserNavigation/helper';
import RedirectAddress from '../../components/redirectAddress';
import { ShowMoreContext } from './helper';

const headerImageMapping = {
  'purchase-asset': NFTImage,
  'buy-item': NFTImage,
  'buy-in-ustx': NFTImage,
  'name-preorder': BNSImage,
  'swap-x-for-y': SwapImage,
  'swap-helper': SwapImage,
};

class Renderer {
  header: ReactNode;

  functionMetaDataView: ReactNode;

  functionArgsView: ReactNode;

  postConditionCards: ReactNode;

  postConditionDenyMessage: ReactNode;

  constructor(
    isShowMore: boolean,
    decodedTxRequest: any,
    functionArguments: ClarityValue[],
    funcMetaData: ContractFunction | null,
    postConditions: PostCondition[],
    stxAddress: string,
    coinMetaData: Coin[] | null,
  ) {
    const Illustration = headerImageMapping[funcMetaData?.name ?? ''];
    const { dappName } = useContext(DappInfoContext);
    this.header = (
      <View style={styles.headerContainer}>
        <img src={Illustration || ContractCall} alt="contract-call" />
        <Text style={styles.headerTitle}>{funcMetaData?.name}</Text>
        {dappName && <Text style={styles.headerSubtitle}>{`Requested by ${dappName}`}</Text>}
      </View>
    );

    this.postConditionDenyMessage = (
      <View>
        <View style={styles.divider} />
        <Text style={styles.sponsorPostConditionText}>
          No transfers (beside fees) will be made from your account or the transaction will abort
        </Text>
        <View style={styles.divider} />
      </View>
    );

    this.functionMetaDataView = (
      <View>
        {/* TODO: Add translation */}
        <Text style={styles.functionTitle}>Function</Text>

        <Text style={styles.functionName}>{decodedTxRequest?.payload?.functionName}</Text>

        {isShowMore && (
          <>
            {/* TODO: Add translation */}
            <RedirectAddress
              title="Contract Address"
              address={`${decodedTxRequest.payload?.contractAddress}.${decodedTxRequest.payload?.contractName}`}
            />
          </>
        )}
      </View>
    );

    this.functionArgsView = isShowMore
      && funcMetaData?.args?.map((arg: Args, index: number) => {
        const funcArg = cvToJSON(functionArguments[index]);

        const argTypeIsOptionalSome = functionArguments[index].type === ClarityType.OptionalSome;

        const funcArgType = argTypeIsOptionalSome
          ? (functionArguments[index] as SomeCV).value?.type
          : functionArguments[index]?.type;

        const funcArgValString = argTypeIsOptionalSome
          ? cvToString((functionArguments[index] as SomeCV).value, 'tryAscii')
          : cvToString(functionArguments[index]);

        const normalizedValue = (() => {
          switch (funcArgType) {
            case ClarityType.UInt:
              return funcArgValString.split('u').join('');
            case ClarityType.Buffer:
              return funcArgValString.substring(1, funcArgValString.length - 1);
            default:
              return funcArgValString;
          }
        })();

        return (
          <View key={`${index}${arg.name}`} style={{ marginTop: 24 }}>
            <Text style={styles.functionArgName}>{arg.name}</Text>
            <Text style={styles.functionArgValue} numberOfLines={1} ellipsizeMode="middle">
              {normalizedValue}
            </Text>
            <Text style={styles.functionArgType}>{funcArg.type}</Text>
          </View>
        );
      });

    this.postConditionCards = (
      <ShowMoreContext.Provider value={{ showMore: isShowMore }}>
        {postConditions?.map((postCondition, i) => {
          switch (postCondition.conditionType) {
            case PostConditionType.STX:
              return (
                <StxPostConditionCard
                  key={i}
                  postCondition={postCondition}
                  walletAddress={stxAddress}
                />
              );
            case PostConditionType.Fungible:
              const coinInfo = coinMetaData?.find(
                (coin: Coin) => coin.contract
                  === `${addressToString(postCondition.assetInfo.address)}.${
                    postCondition.assetInfo.contractName.content
                  }`,
              );
              return (
                <FtPostConditionCard
                  key={i}
                  postCondition={postCondition}
                  ftMetaData={coinInfo}
                  walletAddress={stxAddress}
                />
              );
            case PostConditionType.NonFungible:
              return (
                <NftPostConditionCard
                  key={i}
                  postCondition={postCondition}
                  walletAddress={stxAddress}
                />
              );
            default:
          }
        })}
      </ShowMoreContext.Provider>
    );
  }
}
export default Renderer;
