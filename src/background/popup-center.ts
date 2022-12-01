import type { Windows } from 'webextension-polyfill';

interface PopupOptions {
  url?: string;
  title?: string;
  w?: number;
  h?: number;
  skipPopupFallback?: boolean;
}
export default function popupCenter(options: PopupOptions): Promise<Windows.Window> {
  const { url, w = 370, h = 620 } = options;
  return new Promise((resolve) => {
    chrome.windows.getCurrent(async (win) => {
      // the farthest left/top sides of all displays
      const dualScreenLeft = win.left;
      const dualScreenTop = win.top;

      // dimensions of the window that originated the action
      const { width, height } = win;

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

      resolve(popup);
    });
  });
}
