import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  unsignedSendStxTx: string;
};

function Step3Confirm({ unsignedSendStxTx }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/confirm-stx-tx', {
      state: {
        unsignedTx: unsignedSendStxTx,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unsignedSendStxTx]);

  return <div />;
}
export default Step3Confirm;
