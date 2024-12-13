import {
  type FungiblePostConditionWire,
  type NonFungiblePostConditionWire,
  type STXPostConditionWire,
  PostConditionType,
} from '@stacks/transactions';
import { initBigNumber } from '@utils/helper';
import BigNumber from 'bignumber.js';

const abbreviateNumber = (n: number) => {
  if (n < 1e3) return n.toString();
  if (n >= 1e3 && n < 1e6) return `${+(n / 1e3).toFixed(2)}K`;
  if (n >= 1e6 && n < 1e9) return `${+(n / 1e6).toFixed(2)}M`;
  if (n >= 1e9 && n < 1e12) return `${+(n / 1e9).toFixed(2)}B`;
  if (n >= 1e12) return `${+(n / 1e12).toFixed(2)}T`;
  return n.toString();
};

export const microStxToStx = (mStx: number | string | BigNumber) => {
  const microStacks = initBigNumber(mStx);
  return microStacks.shiftedBy(-6);
};

const stacksValue = ({
  value,
  fixedDecimals = true,
  withTicker = true,
  abbreviate = false,
}: {
  value: number | string | BigNumber;
  fixedDecimals?: boolean;
  withTicker?: boolean;
  abbreviate?: boolean;
}) => {
  const stacks = microStxToStx(value);
  const stxAmount = stacks.toNumber();
  return `${
    abbreviate && stxAmount > 10000
      ? abbreviateNumber(stxAmount)
      : stxAmount.toLocaleString('en-US', {
          maximumFractionDigits: fixedDecimals ? 6 : 3,
        })
  }${withTicker ? ' STX' : ''}`;
};

export const getAmountFromPostCondition = (
  pc: STXPostConditionWire | FungiblePostConditionWire | NonFungiblePostConditionWire,
) => {
  if (pc.conditionType === PostConditionType.Fungible) {
    return pc.amount.toString();
  }
  if (pc.conditionType === PostConditionType.STX) {
    return stacksValue({ value: pc.amount.toString(), withTicker: false });
  }
  if (pc.conditionType === PostConditionType.NonFungible) return '1';
};

function hasAssetInfo(pc: any): pc is { assetInfo: { assetName: { content: string } } } {
  return (
    pc &&
    pc.assetInfo &&
    pc.assetInfo.assetName &&
    typeof pc.assetInfo.assetName.content === 'string'
  );
}

export const getSymbolFromPostCondition = (
  pc: STXPostConditionWire | FungiblePostConditionWire | NonFungiblePostConditionWire,
) => {
  if (hasAssetInfo(pc)) {
    return pc.assetInfo.assetName?.content?.slice(0, 3).toUpperCase();
  }
  return 'STX';
};

export const getNameFromPostCondition = (
  pc: STXPostConditionWire | FungiblePostConditionWire | NonFungiblePostConditionWire,
) => {
  if (hasAssetInfo(pc)) {
    return pc.assetInfo.assetName.content;
  }
  return 'STX';
};
