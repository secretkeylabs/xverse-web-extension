import { InternalMethods } from '@common/types/message-types';
import { Account } from '@secretkeylabs/xverse-core';
import { BackgroundMessages } from 'common/types/messages';

function validateMessagesAreFromExtension(sender: chrome.runtime.MessageSender) {
  // Only respond to internal messages from our UI, not content scripts in other applications
  return sender.url?.startsWith(chrome.runtime.getURL(''));
}

let activeAccount: Account | null = null;

async function internalBackgroundMessageHandler(
  message: BackgroundMessages,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
) {
  if (!validateMessagesAreFromExtension(sender)) {
    return;
  }
  switch (message.method) {
    case InternalMethods.ChangeActiveAccount: {
      const { account } = message.payload;
      activeAccount = account;
      sendResponse();
      break;
    }
    case InternalMethods.RequestActiveAccount: {
      sendResponse(activeAccount);
      break;
    }
    default:
      sendResponse();
  }
  sendResponse();
}

export default internalBackgroundMessageHandler;
