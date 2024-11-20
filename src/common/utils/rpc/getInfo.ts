import { type GetInfoRequestMessage, type Requests, type Return } from '@sats-connect/core';
import { keys } from 'ts-transformer-keys';
import { getTabIdFromPort } from '..';
import { makeRpcSuccessResponse, sendRpcResponse } from './helpers';

declare const VERSION: string;

async function handleGetInfo(message: GetInfoRequestMessage, port: chrome.runtime.Port) {
  const response: Return<'getInfo'> = {
    version: VERSION,

    // TODO: migrate when all methods have been migrated. See
    // https://linear.app/xverseapp/issue/ENG-4623
    methods: keys<Requests>(),
    supports: [],
  };
  sendRpcResponse(getTabIdFromPort(port), makeRpcSuccessResponse(message.id, response));
}

export default handleGetInfo;
