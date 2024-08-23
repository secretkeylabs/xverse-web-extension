import {
  getInfoRequestMessageSchema,
  type Requests,
  type Return,
  type RpcRequestMessage,
} from '@sats-connect/core';
import { keys } from 'ts-transformer-keys';
import * as v from 'valibot';
import { getTabIdFromPort } from '..';
import { handleInvalidMessage } from './handle-invalid-message';
import { makeRpcSuccessResponse, sendRpcResponse } from './helpers';

declare const VERSION: string;

const handleGetInfo = (message: RpcRequestMessage, port: chrome.runtime.Port) => {
  const parseResult = v.safeParse(getInfoRequestMessageSchema, message);

  if (!parseResult.success) {
    handleInvalidMessage(message, getTabIdFromPort(port), parseResult.issues);
    return;
  }

  const response: Return<'getInfo'> = {
    version: VERSION,

    // TODO: migrate when all methods have been migrated. See
    // https://linear.app/xverseapp/issue/ENG-4623
    methods: keys<Requests>(),
    supports: [],
  };
  sendRpcResponse(getTabIdFromPort(port), makeRpcSuccessResponse(parseResult.output.id, response));
};

export default handleGetInfo;
