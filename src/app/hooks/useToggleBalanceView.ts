import useWalletSelector from '@hooks/useWalletSelector';
import {
  setBalanceHiddenToggleAction,
  setShowBalanceInBtcAction,
} from '@stores/wallet/actions/actionCreators';
import { useDispatch } from 'react-redux';

const useToggleBalanceView = (skipShowBalanceInBtc = false) => {
  const dispatch = useDispatch();
  const { balanceHidden, showBalanceInBtc } = useWalletSelector();
  let balanceDisplayState: 'unmodified' | 'btc' | 'hidden' = 'unmodified';

  if (showBalanceInBtc && !balanceHidden && !skipShowBalanceInBtc) {
    balanceDisplayState = 'btc';
  }

  if (!showBalanceInBtc && balanceHidden) {
    balanceDisplayState = 'hidden';
  }

  const toggleBalanceView = () => {
    if (showBalanceInBtc || (!balanceHidden && skipShowBalanceInBtc)) {
      // if balance is in BTC
      // or balance is not hidden and on BTC screen
      // we hide the balance
      dispatch(setBalanceHiddenToggleAction({ toggle: true }));
      dispatch(setShowBalanceInBtcAction({ toggle: false }));
      return;
    }

    if (balanceHidden) {
      // if balance is hidden, we show the balance in fiat
      dispatch(setBalanceHiddenToggleAction({ toggle: false }));
      dispatch(setShowBalanceInBtcAction({ toggle: false }));
      return;
    }

    // if balance is in fiat
    // and not on BTC screen
    // we show the balance in BTC
    if (!skipShowBalanceInBtc) {
      dispatch(setBalanceHiddenToggleAction({ toggle: false }));
      dispatch(setShowBalanceInBtcAction({ toggle: true }));
    }
  };

  return { toggleBalanceView, balanceDisplayState };
};

export default useToggleBalanceView;
