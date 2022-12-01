import { InternalMethods } from 'content-scripts/message-types';
import { BackgroundMessages } from 'content-scripts/messages';

function validateMessagesAreFromExtension(sender: chrome.runtime.MessageSender) {
  // Only respond to internal messages from our UI, not content scripts in other applications
  return sender.url?.startsWith(chrome.runtime.getURL(''));
}

let inMemoryKey = '';

async function internalBackgroundMessageHandler(
  message: BackgroundMessages,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
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
      sendResponse();
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
}

export default internalBackgroundMessageHandler;
