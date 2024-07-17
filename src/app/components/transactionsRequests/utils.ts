import {
  MESSAGE_SOURCE,
  StacksLegacyMethods,
  type TransactionResponseMessage,
  type TxResult,
} from '@common/types/message-types';

interface FormatTxSignatureResponseArgs {
  payload: string;
  response: TxResult | 'cancel';
}
function formatTxSignatureResponse({
  payload,
  response,
}: FormatTxSignatureResponseArgs): TransactionResponseMessage {
  return {
    source: MESSAGE_SOURCE,
    method: StacksLegacyMethods.transactionResponse,
    payload: {
      transactionRequest: payload,
      transactionResponse: response,
    },
  };
}

interface FinalizeTxSignatureArgs {
  requestPayload: string;
  data: TxResult | 'cancel';
  tabId: number;
}

export default function finalizeTxSignature({
  requestPayload,
  data,
  tabId,
}: FinalizeTxSignatureArgs) {
  try {
    const responseMessage = formatTxSignatureResponse({ payload: requestPayload, response: data });
    chrome.tabs.sendMessage(tabId, responseMessage);
  } catch (e) {
    console.log(e);
  }
}
