import CheckCircle from '@assets/img/createWalletSuccess/CheckCircle.svg';
import Extension from '@assets/img/createWalletSuccess/extension.svg';
import Logo from '@assets/img/createWalletSuccess/logo.svg';
import Pin from '@assets/img/createWalletSuccess/pin.svg';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const InstructionsContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
  position: 'absolute',
  top: 20,
  right: 30,
  height: 127,
  width: 278,
  backgroundColor: 'rgba(39, 42, 68, 0.4)',
  border: `1px solid ${props.theme.colors.background.elevation3}`,
  borderRadius: 12,
  padding: `${props.theme.spacing(10.5)}px ${props.theme.spacing(10.5)}px ${props.theme.spacing(
    10.5,
  )}px ${props.theme.spacing(10.5)}px`,
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
});

const InstructionsText = styled.h1((props) => ({
  ...props.theme.body_medium_l,
  color: 'rgba(255, 255, 255, 0.7)',
}));

const Image = styled.img((props) => ({
  marginLeft: props.theme.spacing(3.5),
  marginRight: props.theme.spacing(3.5),
}));

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
  fontSize: 20,
}));

const Subtitle = styled.h2((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
  marginTop: props.theme.spacing(8),
  textAlign: 'center',
}));

const ContinueButton = styled.button((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.background.elevation0,
  backgroundColor: props.theme.colors.action.classic,
  borderRadius: props.theme.radius(1),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(30),
  height: 44,
  textAlign: 'center',
  ':hover': {
    background: props.theme.colors.action.classicLight,
  },
  ':focus': {
    background: props.theme.colors.action.classicLight,
    opacity: 0.6,
  },
}));

function CreateWalletSuccess(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'WALLET_SUCCESS_SCREEN' });
  const { action } = useParams();

  const handleCloseTab = () => {
    window.close();
  };

  return (
    <>
      <ContentContainer>
        <img src={CheckCircle} alt="success" />
        <Title>{action === 'restore' ? t('RESTORE_SCREEN_TITLE') : t('SCREEN_TITLE')}</Title>
        <Subtitle>
          {action === 'restore' ? t('RESTORE_SCREEN_SUBTITLE') : t('SCREEN_SUBTITLE')}
        </Subtitle>
      </ContentContainer>
      <ContinueButton onClick={handleCloseTab}>{t('CLOSE_TAB')}</ContinueButton>
      <InstructionsContainer>
        <RowContainer>
          <InstructionsText>{`1. ${t('CLICK')}`}</InstructionsText>
          <Image src={Extension} />
        </RowContainer>
        <RowContainer>
          <InstructionsText>{`2. ${t('SEARCH_XVERSE')}`}</InstructionsText>
          <Image src={Pin} />
        </RowContainer>
        <RowContainer>
          <InstructionsText>{`3. ${t('CLICK')}`}</InstructionsText>
          <Image src={Logo} />
          <InstructionsText>{t('OPEN_WALLET')}</InstructionsText>
        </RowContainer>
      </InstructionsContainer>
    </>
  );
}

export default CreateWalletSuccess;
