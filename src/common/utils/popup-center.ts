import { POPUP_WIDTH } from '@utils/constants';
import type { Windows } from 'webextension-polyfill';

interface PopupOptions {
  url?: string;
  title?: string;
  w?: number;
  h?: number;
  skipPopupFallback?: boolean;
}
export default function popupCenter(options: PopupOptions): Promise<Windows.Window> {
  const { url, w = POPUP_WIDTH, h = 600 } = options;
  return new Promise((resolve) => {
    chrome.windows.getCurrent(async (win) => {
      // the farthest left/top sides of all displays
      const dualScreenLeft = win.left ?? 0;
      const dualScreenTop = win.top ?? 0;

      // dimensions of the window that originated the action
      const { width = 0, height = 0 } = win;

      const left = Math.floor(width / 2 - w / 2 + dualScreenLeft);
      const top = Math.floor(height / 2 - h / 2 + dualScreenTop);

      const popup = await chrome.windows.create({
        url,
        width: w,
        height: h,
        top,
        left,
        focused: true,
        type: 'popup',
      });

      resolve(popup as Windows.Window);
    });
  });
}
