import {
  MESSAGE_SOURCE,
  SignatureResponseMessage,
  StacksLegacyMethods,
} from '@common/types/message-types';
import { SignatureData } from '@stacks/connect';

interface FormatMessageSigningResponseArgs {
  request: string;
  response: SignatureData | string;
}
export function formatMessageSigningResponse({
  request,
  response,
}: FormatMessageSigningResponseArgs): SignatureResponseMessage {
  return {
    source: MESSAGE_SOURCE,
    method: StacksLegacyMethods.signatureResponse,
    payload: { signatureRequest: request, signatureResponse: response },
  };
}

interface FinalizeMessageSignatureArgs {
  requestPayload: string;
  tabId: number;
  data: SignatureData | string;
}
export function finalizeMessageSignature({
  requestPayload,
  data,
  tabId,
}: FinalizeMessageSignatureArgs) {
  const responseMessage = formatMessageSigningResponse({ request: requestPayload, response: data });
  chrome.tabs.sendMessage(tabId, responseMessage);
  window.close();
}
