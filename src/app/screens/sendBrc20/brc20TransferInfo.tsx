import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginLeft: '5%',
  marginRight: '5%',
});

const InfoTitle = styled.h1((props) => ({
  ...props.theme.headline_m,
  marginTop: props.theme.spacing(8),
}));

const InfoSubtitle = styled.h2((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(6),
}));

const TransferStepTitle = styled.h3((props) => ({
  ...props.theme.body_bold_m,
  marginTop: props.theme.spacing(20),
}));

const TransferStep = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(2),
}));

function Brc20TransferInfo() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND_BRC20' });
  return (
    <Container>
      <InfoTitle>{t('SEND_INFO_TITLE')}</InfoTitle>
      <InfoSubtitle>{t('SEND_INFO_SUBTITLE')}</InfoSubtitle>
      <TransferStepTitle>1. {t('SEND_STEP_1_TITLE')}</TransferStepTitle>
      <TransferStep>{t('SEND_STEP_1')}</TransferStep>
      <TransferStepTitle>2. {t('SEND_STEP_2_TITLE')}</TransferStepTitle>
      <TransferStep>{t('SEND_STEP_2')}</TransferStep>
    </Container>
  );
}

export default Brc20TransferInfo;
