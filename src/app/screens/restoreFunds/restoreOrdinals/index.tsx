import TopRow from '@components/topRow';
import useWalletSelector from '@hooks/useWalletSelector';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ActionButton from '@components/button';
import BottomTabBar from '@components/tabBar';
import useOrdinalsByAddress from '@hooks/useOrdinalsByAddress';
import { useState } from 'react';
import OrdinalRow from './oridnalRow';

const RestoreFundTitle = styled.h1((props) => ({
  ...props.theme.body_l,
  marginBottom: 32,
  color: props.theme.colors.white[200],
}));

const ErrorContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  alignItems: 'flex-end',
}));

const Container = styled.div({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  marginLeft: 16,
  marginTop: 32,
  marginRight: 16,
});

const ErrorText = styled.h1((props) => ({
  ...props.theme.body_xs,
  marginBottom: 20,
  color: props.theme.colors.feedback.error,
}));

const ButtonContainer = styled.div({
  marginBottom: 32,
  flex: 1,
  display: 'flex',
  alignItems: 'flex-end',
});

function RestoreOrdinals() {
  const { t } = useTranslation('translation', { keyPrefix: 'RESTORE_ORDINAL_SCREEN' });
  const {
    btcAddress,
  } = useWalletSelector();
  const navigate = useNavigate();
  const { ordinals } = useOrdinalsByAddress(btcAddress);
  const [error, setError] = useState('');
  const location = useLocation();
  const isRestoreFundFlow = location.state?.isRestoreFundFlow;
  const handleOnCancelClick = () => {
    if (isRestoreFundFlow) {
      navigate('/send-btc');
    } else { navigate(-1); }
  };

  return (
    <>
      <TopRow title={t('TITLE')} onClick={handleOnCancelClick} />
      <Container>
        {ordinals?.length === 0 ? (
          <>
            <RestoreFundTitle>{t('NO_FUNDS')}</RestoreFundTitle>
            <ButtonContainer>
              <ActionButton text={t('BACK')} onPress={handleOnCancelClick} />
            </ButtonContainer>
          </>
        )
          : (
            <>
              <RestoreFundTitle>{t('DESCRIPTION')}</RestoreFundTitle>
              {ordinals?.map((ordinal) => (
                <OrdinalRow setError={setError} ordinal={ordinal} />
              ))}
              <ErrorContainer>
                <ErrorText>{error}</ErrorText>
              </ErrorContainer>
            </>
          )}
      </Container>
      <BottomTabBar tab="nft" />
    </>
  );
}

export default RestoreOrdinals;
