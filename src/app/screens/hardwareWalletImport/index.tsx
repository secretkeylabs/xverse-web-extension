import Button from '@ui-library/button';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HardwareWalletImport() {
  const navigate = useNavigate();

  const connectWallet = useCallback(() => {
    navigate('/hardware-wallet-import/keystone');
  }, [navigate]);

  return (
    <div>
      <Button title="Connect Keystone" onClick={() => connectWallet()}>
        Connect Keystone
      </Button>
    </div>
  );
}
