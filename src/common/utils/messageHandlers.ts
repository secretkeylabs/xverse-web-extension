import { BackgroundMessages } from 'common/types/messages';

function validateMessagesAreFromExtension(sender: chrome.runtime.MessageSender) {
  // Only respond to internal messages from our UI, not content scripts in other applications
  return sender.url?.startsWith(chrome.runtime.getURL(''));
}

async function internalBackgroundMessageHandler(
  message: BackgroundMessages,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
) {
  if (!validateMessagesAreFromExtension(sender)) {
    return;
  }
  sendResponse();
}

export default internalBackgroundMessageHandler;
