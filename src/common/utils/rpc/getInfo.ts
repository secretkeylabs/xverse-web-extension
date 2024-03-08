import { Requests, Return, RpcId } from 'sats-connect';
import { keys } from 'ts-transformer-keys';
import { makeRpcSuccessResponse, sendRpcResponse } from './helpers';

declare const VERSION: string;

const handleGetInfo = (requestId: RpcId, tabId: number) => {
  const response: Return<'getInfo'> = {
    version: VERSION,
    methods: keys<Requests>(),
    supports: [],
  };
  sendRpcResponse(tabId, makeRpcSuccessResponse(requestId, response));
};

export default handleGetInfo;
