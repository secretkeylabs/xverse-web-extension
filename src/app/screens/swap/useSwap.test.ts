import { Currency } from 'alex-sdk';

// TODO tim: fix jest transpiler to be able to import xverse-core
// for now, the function is copied in place.
//
// import { selectedTokenReducer } from './useSwap';

type SelectedCurrencyState = {
  to?: Currency;
  from?: Currency;
  prevTo?: Currency;
  prevFrom?: Currency;
};

type Side = 'from' | 'to';

function updateOppositeCurrencyIfSameAsSelected(state, { newCurrency, side }) {
  switch (side) {
    case 'from':
      if (state.to !== newCurrency) {
        return state.to;
      }
      if (state.to === newCurrency && state.prevTo !== newCurrency) {
        return state.prevTo;
      }
      return undefined;
    case 'to':
      if (state.from !== newCurrency) {
        return state.from;
      }
      if (state.from === newCurrency && state.prevFrom !== newCurrency) {
        return state.prevFrom;
      }
      return undefined;
    default:
      return state.to;
  }
}
const selectedTokenReducer: (
  state: SelectedCurrencyState,
  { newCurrency, side }: { newCurrency: Currency; side: Side },
) => SelectedCurrencyState = (state, { newCurrency, side }) => {
  switch (side) {
    case 'from':
      return {
        ...state,
        prevFrom: state.from,
        from: newCurrency,
        to: updateOppositeCurrencyIfSameAsSelected(state, { newCurrency, side }),
      };
    case 'to':
      return {
        ...state,
        prevTo: state.to,
        to: newCurrency,
        from: updateOppositeCurrencyIfSameAsSelected(state, { newCurrency, side }),
      };
    default:
      return state;
  }
};

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
