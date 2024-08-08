/* eslint-disable import/prefer-default-export */
import { walletEventName } from '@common/walletEvents';
import { walletEventSchema, type AddListener, type WalletEvent } from '@sats-connect/core';
import * as v from 'valibot';

type EventNames = WalletEvent['type'];

// This declaration supplements the set of built-in event names with the name of
// wallet events. This is necessary to register event listeners typed to handle
// wallet events.
declare global {
  interface WindowEventMap {
    [walletEventName]: CustomEvent<WalletEvent>;
  }
}

const listenersMap = new Map<EventNames, Set<Function>>();

let walletEventListener: undefined | ((event: CustomEvent<WalletEvent>) => void);

function addEventCallback(eventName: EventNames, cb: Function) {
  const listeners = listenersMap.get(eventName) || new Set();
  listeners.add(cb);
  listenersMap.set(eventName, listeners);
}

function initWalletEventListener() {
  walletEventListener = (event: CustomEvent) => {
    const { detail } = event;
    if (!v.is(walletEventSchema, detail)) {
      // eslint-disable-next-line no-console
      console.warn('Received an unrecognized wallet event:', event);
      return;
    }

    const listeners = listenersMap.get(detail.type);
    if (!listeners) return;
    listeners.forEach((cb) => cb(detail));
  };

  window.addEventListener(walletEventName, walletEventListener);
}

export const addListener: AddListener = (eventName, cb) => {
  if (!walletEventListener) {
    // Initialize the wallet event listener the first time an event listener is
    // added as there's no need to listen for events if there are no listeners.
    initWalletEventListener();
  }

  addEventCallback(eventName, cb);

  return () => {
    const listeners = listenersMap.get(eventName);
    if (!listeners) return;
    listeners.delete(cb);
    if (listeners.size === 0) {
      listenersMap.delete(eventName);
    }

    // Stop listening for wallet events when there are no more listeners.
    if (listenersMap.size === 0) {
      if (!walletEventListener) {
        // eslint-disable-next-line no-console
        console.error('Expected `walletEventListener` to be defined.');
        return;
      }

      window.removeEventListener(walletEventName, walletEventListener);
      walletEventListener = undefined;
    }
  };
};
