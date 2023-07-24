/* eslint-disable no-nested-ternary */
import useSecretKey from '@hooks/useSecretKey';
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChromeStorage from '@utils/storage';

interface AuthGuardProps {
  children: ReactNode;
}

function AuthGuard({ children }: AuthGuardProps) {
  const { getSeed } = useSecretKey();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const encryptedSeed = await ChromeStorage.getItem('encryptedKey');
      if(!encryptedSeed) {
        navigate('/landing');
        return
      }
      try {
       await getSeed();
      } catch (error) {
        navigate('/login');
      }

    })();
  }, []);

  return children
}

export default AuthGuard;
