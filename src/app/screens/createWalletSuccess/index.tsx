import CheckCircle from '@assets/img/createWalletSuccess/CheckCircle.svg';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ContentContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: props.theme.spacing(8),
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}));

const Title = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white['0'],
  marginTop: props.theme.spacing(8),
  textAlign: 'center',
}));

const Subtitle = styled.h2((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
  marginTop: props.theme.spacing(8),
  textAlign: 'center',
}));

const ContinueButton = styled.button((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['0'],
  backgroundColor: props.theme.colors.action.classic,
  borderRadius: props.theme.radius(1),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(30),
  height: 44,
  textAlign: 'center',
}));

function CreateWalletSuccess(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'WALLET_SUCCESS_SCREEN' });
  const navigate = useNavigate();

  const handleOpenWallet = () => {
    navigate('/home');
  };

  return (
    <>
      <ContentContainer>
        <img src={CheckCircle} alt="success" />
        <Title>
          {t('SCREEN_TITLE')}
        </Title>
        <Subtitle>
          {t('SCREEN_SUBTITLE')}
        </Subtitle>
      </ContentContainer>
      <ContinueButton onClick={handleOpenWallet}>
        {t('OPEN_WALLET_BUTTON')}
      </ContinueButton>
    </>
  );
}

export default CreateWalletSuccess;
