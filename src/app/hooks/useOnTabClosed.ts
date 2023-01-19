import { InternalMethods } from 'content-scripts/message-types';
import { BackgroundMessages } from 'content-scripts/messages';
import { useEffect } from 'react';

export default function useOnOriginTabClose(
  tabId: number,
  handler: () => void,
) {
  useEffect(() => {
    const messageHandler = (message: BackgroundMessages) => {
      if (message.method !== InternalMethods.OriginatingTabClosed) return;
      if (message.payload.tabId === Number(tabId)) {
        handler();
      }
    };

    chrome.runtime.onMessage.addListener(messageHandler);

    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);
}
