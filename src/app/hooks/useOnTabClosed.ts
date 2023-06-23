import { InternalMethods } from '@common/types/message-types';
import { BackgroundMessages } from '@common/types/messages';
import { useEffect } from 'react';

export default function useOnOriginTabClose(tabId: number, handler: () => void) {
  useEffect(() => {
    const messageHandler = (message: BackgroundMessages) => {
      if (message.method !== InternalMethods.OriginatingTabClosed) return;
      if (message.payload.tabId === Number(tabId)) {
        handler();
      }
    };

    chrome.runtime.onMessage.addListener(messageHandler);

    return () => chrome.runtime.onMessage.removeListener(messageHandler);
  }, []);
}
