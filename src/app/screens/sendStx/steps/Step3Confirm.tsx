import { stxToMicrostacks } from '@secretkeylabs/xverse-core';
import RoutePaths from 'app/routes/paths';
import BigNumber from 'bignumber.js';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  unsignedSendStxTx: string;
  fee: string;
};

function Step3Confirm({ unsignedSendStxTx, fee }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(RoutePaths.ConfirmStacksTransaction, {
      state: {
        unsignedTx: unsignedSendStxTx,
        fee: stxToMicrostacks(new BigNumber(fee)).toString(),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
export default Step3Confirm;
