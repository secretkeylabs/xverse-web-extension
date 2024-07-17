import { Currency } from 'alex-sdk';
import { describe, expect, test } from 'vitest';
import { type Side } from './types';
import { selectedTokenReducer } from './useSwap';

describe('useSwap', () => {
  describe('selectedTokenReducer', () => {
    [
      {
        name: 'simple case, no same tokens',
        state: {
          to: undefined,
          from: undefined,
          prevTo: undefined,
          prevFrom: undefined,
        },
        payload: {
          newCurrency: Currency.ALEX,
          side: 'to' as Side,
        },
        expected: {
          to: Currency.ALEX,
          from: undefined,
          prevTo: undefined,
          prevFrom: undefined,
        },
      },
      {
        name: 'same token selected, other token will fall back to previously selected token',
        state: {
          to: Currency.ALEX,
          from: undefined,
          prevTo: Currency.STX,
          prevFrom: undefined,
        },
        payload: {
          newCurrency: Currency.ALEX,
          side: 'from' as Side,
        },
        expected: {
          to: Currency.STX,
          from: Currency.ALEX,
          prevTo: Currency.STX,
          prevFrom: undefined,
        },
      },
      {
        name: 'same token selected, and other token cannot fallback. should be unselected',
        state: {
          to: Currency.STX,
          from: Currency.ALEX,
          prevTo: Currency.ALEX,
          prevFrom: Currency.ALEX,
        },
        payload: {
          newCurrency: Currency.ALEX,
          side: 'to' as Side,
        },
        expected: {
          to: Currency.ALEX,
          from: undefined,
          prevTo: Currency.STX,
          prevFrom: Currency.ALEX,
        },
      },
    ].forEach(({ name, state, payload, expected }) => {
      test(name, () => {
        expect(selectedTokenReducer(state, payload)).toEqual(expected);
      });
    });
  });
});
