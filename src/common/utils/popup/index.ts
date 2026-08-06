import { parse, stringify } from '@aryzing/superqs';
import { InternalMethods } from '@common/types/message-types';
import {
  sendMessage,
  type GetApprovalRequestResponse,
} from '@common/types/messages';
import { error, success, type Result } from '@secretkeylabs/xverse-core';
import * as v from 'valibot';
import { getOriginFromPort, getTabIdFromPort } from '..';
import { createApprovalRequest, deleteApprovalRequest } from '../approvalRequestStore';

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
  const { url, width: popupWidth = 360, height: popupHeight = 600 } = options;

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

/** Opaque id in the querystring — payload lives in the SW approval store. */
export const popupRequestIdParamName = 'requestId';

/** @deprecated Legacy superqs blob param; still readable for in-flight popups. */
const popupPaylodUrlParamName = 'p';

/**
 * Resolve requestId from either `?requestId=` (modern) or hash query
 * (`#/path?requestId=`) used by legacy window opens.
 */
export function resolveRequestIdFromLocation(
  loc: Pick<Location, 'search' | 'hash'> = document.location,
): string | null {
  const searchId = new URLSearchParams(loc.search).get(popupRequestIdParamName);
  if (searchId) {
    return searchId;
  }
  const hash = loc.hash ?? '';
  const q = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
  return new URLSearchParams(q).get(popupRequestIdParamName);
}

/**
 * Opens the wallet popup as configured by the provided options.
 *
 * Payload is stored in the background approval store; the URL only carries an
 * opaque {@linkcode popupRequestIdParamName}.
 */
export async function openPopup<TPopupData>(options: Options<TPopupData>) {
  const requestId = createApprovalRequest({
    kind: 'popup',
    context: options.context,
    data: options.data,
  });

  const search = new URLSearchParams();
  search.set(popupRequestIdParamName, requestId);

  const url = `/popup.html?${search.toString()}#${options.path}`;

  const popupWindow = await chrome.windows.create(await createCenteredPopupOptions({ url }));

  if (options.onClose) {
    const { onClose } = options;
    const callback = (id: number) => {
      if (popupWindow.id !== id) return;
      deleteApprovalRequest(requestId);
      onClose(popupWindow);
      chrome.windows.onRemoved.removeListener(callback);
    };
    chrome.windows.onRemoved.addListener(callback);
  } else {
    const cleanup = (id: number) => {
      if (popupWindow.id !== id) return;
      deleteApprovalRequest(requestId);
      chrome.windows.onRemoved.removeListener(cleanup);
    };
    chrome.windows.onRemoved.addListener(cleanup);
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
 *
 * Prefers the opaque request-store path; falls back to legacy `?p=` superqs for
 * any in-flight popups opened before upgrade.
 */
export async function getPopupPayload<TData>(
  dataParser: (data: any) => TData,
): Promise<Result<PopupPayload<TData>>> {
  const requestId = resolveRequestIdFromLocation();

  if (requestId) {
    const response = (await chrome.runtime.sendMessage({
      method: InternalMethods.GetApprovalRequest,
      payload: { requestId },
    })) as GetApprovalRequestResponse | undefined;

    if (!response?.ok) {
      return error({
        name: 'ApprovalRequestNotFoundError',
        message: response?.error ?? 'Approval request not found or expired',
      });
    }

    if (response.record.kind !== 'popup' || !response.record.context) {
      return error({
        name: 'InvalidApprovalRequestKindError',
        message: 'Approval request is not a popup payload',
      });
    }

    let parsedData: TData;
    try {
      parsedData = dataParser(response.record.data);
    } catch (e) {
      return error({
        name: 'DataParserError',
        message: 'Failed to parse data with provided data parser.',
        data: e,
      });
    }

    return success({ context: response.record.context, data: parsedData });
  }

  // Legacy fallback: payload embedded in querystring via superqs.
  const params = new URLSearchParams(document.location.search);
  const payloadParam = params.get(popupPaylodUrlParamName);

  if (typeof payloadParam !== 'string') {
    return error({
      name: 'NoPayloadParameterError',
      message: 'No requestId or legacy payload parameter found in URL',
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

/** Fetch legacy approval params (signPsbt URL fields) by opaque requestId. */
export async function getLegacyApprovalParams(): Promise<Result<Record<string, string>>> {
  const requestId = resolveRequestIdFromLocation(
    typeof window !== 'undefined'
      ? {
          search: window.location.search,
          // React Router hash routes keep params in the hash query
          hash: window.location.hash,
        }
      : document.location,
  );

  // Also accept requestId from react-router style search alone
  if (!requestId) {
    return error({
      name: 'NoRequestIdError',
      message: 'No requestId found in URL',
    });
  }

  const response = (await chrome.runtime.sendMessage({
    method: InternalMethods.GetApprovalRequest,
    payload: { requestId },
  })) as GetApprovalRequestResponse | undefined;

  if (!response?.ok) {
    return error({
      name: 'ApprovalRequestNotFoundError',
      message: response?.error ?? 'Approval request not found or expired',
    });
  }

  if (response.record.kind !== 'legacy' || !response.record.legacyParams) {
    return error({
      name: 'InvalidApprovalRequestKindError',
      message: 'Approval request is not a legacy params payload',
    });
  }

  return success(response.record.legacyParams);
}

// Re-export stringify for any residual callers; prefer the request store.
export { stringify as __legacyStringifyPopupPayload };
