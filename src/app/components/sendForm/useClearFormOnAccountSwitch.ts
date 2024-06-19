import useSelectedAccount from '@hooks/useSelectedAccount';
import { useEffect, useRef, useState } from 'react';

export default function useClearFormOnAccountSwitch() {
  const selectedAccount = useSelectedAccount();
  const [isAccountSwitched, setIsAccountSwitched] = useState(false);

  const isFirstRender = useRef(false);
  useEffect(() => {
    if (isFirstRender.current) {
      setIsAccountSwitched(true);
    } else {
      // if first render then dont clear form input fields
      isFirstRender.current = true;
    }
  }, [selectedAccount]);

  return {
    isAccountSwitched,
  };
}
