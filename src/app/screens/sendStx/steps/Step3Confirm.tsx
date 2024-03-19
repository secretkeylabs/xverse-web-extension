import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  unsignedSendStxTx: string;
  fee: string;
};

function Step3Confirm({ unsignedSendStxTx, fee }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/confirm-stx-tx', {
      state: {
        unsignedTx: unsignedSendStxTx,
        fee,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div />;
}
export default Step3Confirm;
