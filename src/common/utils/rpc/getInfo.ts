import { Return, RpcId } from 'sats-connect';
import { makeRpcSuccessResponse, sendRpcResponse } from './helpers';

declare const VERSION: string;

const handleGetInfo = (requestId: RpcId, tabId: number) => {
  const response: Return<'getInfo'> = {
    version: VERSION,
    // TODO fill the array based on the requests interface
    methods: [],
    supports: [],
  };
  sendRpcResponse(tabId, makeRpcSuccessResponse(requestId, response));
};

export default handleGetInfo;
