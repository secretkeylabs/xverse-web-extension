import { parse, stringify } from '@aryzing/superqs';
import { InternalMethods } from '@common/types/message-types';
import { sendMessage } from '@common/types/messages';
import { error, success, type Result } from '@secretkeylabs/xverse-core';
import { POPUP_WIDTH } from '@utils/constants';
import * as v from 'valibot';
import { getOriginFromPort, getTabIdFromPort } from '..';

const contextSchema = v.object({
  /**
   * The URL origin of the tab that initiated the request being sent to the
   * popup.
   */
  origin: v.string(),

  /** The tab that initiated the request being sent to the popup. */
  tabId: v.number(),
});

export type Context = v.InferOutput<typeof contextSchema>;

type PopupPayload<TData = undefined> = {
  /**
   * Arbitrary data sent to the popup. It may be just about any JavaScript
   * value. The data is recoverable with {@linkcode getPopupPayload}.
   *
   * Check [`@aryzing/superqs`](https://github.com/aryzing/superqs) used under
   * the hood for all supported data types.
   */
  data: TData;
  context: Context;
};

/**
 * Options to configure a popup's behavior.
 */
type Options<TData> = {
  /** The path the popup is opened to. */
  path: string;
  onClose?: (popupWindow: chrome.windows.Window) => void;
} & PopupPayload<TData>;

async function createCenteredPopupOptions(
  options: Pick<chrome.windows.CreateData, 'url' | 'height' | 'width'>,
): Promise<chrome.windows.CreateData> {
  const { url, width: popupWidth = POPUP_WIDTH, height: popupHeight = 600 } = options;

  const win = await chrome.windows.getCurrent();
  const {
    left: windowLeft = 0,
    top: windowTop = 0,
    width: windowWidth = 0,
    height: windowHeight = 0,
  } = win;

  const popupLeft = Math.floor(windowWidth / 2 - popupWidth / 2 + windowLeft);
  const popupTop = Math.floor(windowHeight / 2 - popupHeight / 2 + windowTop);

  return {
    url,
    width: popupWidth,
    height: popupHeight,
    top: popupTop,
    left: popupLeft,
    focused: true,
    type: 'popup',
  };
}

const popupPaylodUrlParamName = 'p';

/**
 * Opens the wallet popup as configured by the provided options.
 */
export async function openPopup<TPopupData>(options: Options<TPopupData>) {
  const search = new URLSearchParams();
  search.append(
    popupPaylodUrlParamName,
    stringify({ context: options.context, data: options.data }),
  );

  const url = `/popup.html?${search.toString()}#${options.path}`;

  const popupWindow = await chrome.windows.create(await createCenteredPopupOptions({ url }));

  if (options.onClose) {
    const { onClose } = options;
    const callback = (id: number) => {
      if (popupWindow.id !== id) return;
      onClose(popupWindow);
      chrome.windows.onRemoved.removeListener(callback);
    };
    chrome.windows.onRemoved.addListener(callback);
  }

  // Notify popup when origin tab is closed.
  const { context } = options;
  const callback = (id: number) => {
    if (context.tabId !== id) return;
    sendMessage({
      method: InternalMethods.OriginatingTabClosed,
      payload: { tabId: context.tabId },
    });
    chrome.windows.onRemoved.removeListener(callback);
  };
  chrome.windows.onRemoved.addListener(callback);

  // Remove originating tab listener when popup is closed
  const removeListenersCallback = (id: number) => {
    if (popupWindow.id !== id) return;
    chrome.windows.onRemoved.removeListener(callback);
    chrome.windows.onRemoved.removeListener(removeListenersCallback);
  };
  chrome.windows.onRemoved.addListener(removeListenersCallback);

  return popupWindow;
}

/**
 * Helper for creating the context object required by {@linkcode Options} when
 * opening a new popup with {@linkcode openPopup}.
 */
export function makeContext(port: chrome.runtime.Port): Context {
  return {
    origin: getOriginFromPort(port),
    tabId: getTabIdFromPort(port),
  };
}

const payloadSchema = v.object({
  context: contextSchema,
  data: v.optional(v.any()),
});

/**
 * Retrieves context and data sent to the popup by {@linkcode openPopup}.
 */
export function getPopupPayload<TData>(
  dataParser: (data: any) => TData,
): Result<PopupPayload<TData>> {
  const params = new URLSearchParams(document.location.search);
  const payloadParam = params.get(popupPaylodUrlParamName);

  if (typeof payloadParam !== 'string') {
    return error({
      name: 'NoPayloadParameterError',
      message: 'No payload parameter found in URL',
    });
  }

  let maybePayload: unknown;
  try {
    maybePayload = parse(payloadParam);
  } catch (e) {
    return error({
      name: 'PopupPayloadParseError',
      message: 'Failed to parse popup payload',
      data: e,
    });
  }

  const parseResult = v.safeParse(payloadSchema, maybePayload);
  if (!parseResult.success) {
    return error({
      name: 'InvalidPopupPayloadError',
      message: 'Invalid payload payload.',
      data: parseResult.issues,
    });
  }

  const { context, data } = parseResult.output;
  let parsedData: TData;
  try {
    parsedData = dataParser(data);
  } catch (e) {
    return error({
      name: 'DataParserError',
      message: 'Failed to parse data with provided data parser.',
      data: e,
    });
  }

  return success({ context, data: parsedData });
}
