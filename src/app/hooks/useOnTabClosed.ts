import { InternalMethods } from 'content-scripts/message-types';
import { BackgroundMessages } from 'content-scripts/messages';
import { useEffect } from 'react';
import useDappRequest from './useTransationRequest';

export default function useOnOriginTabClose(handler: () => void) {
  const { tabId } = useDappRequest();

  useEffect(() => {
    const messageHandler = (message: BackgroundMessages) => {
      if (message.method !== InternalMethods.OriginatingTabClosed) return;
      if (message.payload.tabId === Number(tabId)) {
        handler();
      }
    };

    chrome.runtime.onMessage.addListener(messageHandler);

    return () => chrome.runtime.onMessage.removeListener(handler);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
