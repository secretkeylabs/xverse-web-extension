import { InternalMethods } from '@common/types/message-types';
import { BackgroundMessages } from 'common/types/messages';

function validateMessagesAreFromExtension(sender: chrome.runtime.MessageSender) {
  // Only respond to internal messages from our UI, not content scripts in other applications
  return sender.url?.startsWith(chrome.runtime.getURL(''));
}

let inMemoryKey = '';

async function internalBackgroundMessageHandler(
  message: BackgroundMessages,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  if (!validateMessagesAreFromExtension(sender)) {
    return;
  }
  switch (message.method) {
    case InternalMethods.ShareInMemoryKeyToBackground: {
      const { secretKey } = message.payload;
      inMemoryKey = secretKey;
      sendResponse();
      break;
    }

    case InternalMethods.RequestInMemoryKeys: {
      sendResponse(inMemoryKey);
      break;
    }

    case InternalMethods.RemoveInMemoryKeys: {
      inMemoryKey = '';
      sendResponse();
      break;
    }
    default:
      sendResponse();
  }
  sendResponse();
}

export default internalBackgroundMessageHandler;
