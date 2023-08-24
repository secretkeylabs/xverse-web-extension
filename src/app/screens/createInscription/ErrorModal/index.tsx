import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { InscriptionErrorCode } from '@secretkeylabs/xverse-core';

import CloseIcon from '@assets/img/x.svg';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0px;
  left: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(18, 21, 30, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1;
`;

const CardContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.background.elevation3,
  borderRadius: 12,
  padding: props.theme.spacing(8),
  justifyContent: 'center',
  marginBottom: props.theme.spacing(6),
  fontSize: 14,
  width: '100vw',
  margin: props.theme.spacing(12),
}));

const Title = styled.div((props) => ({
  fontWeight: 700,
  lineHeight: '140%',
  color: props.theme.colors.white[0],
  position: 'relative',
  width: '100%',
  paddingTop: props.theme.spacing(2),
  paddingBottom: props.theme.spacing(8),
}));

const CloseTick = styled.img((props) => ({
  width: props.theme.spacing(12),
  height: props.theme.spacing(12),
  position: 'absolute',
  right: 0,
  cursor: 'pointer',
}));

const Rule = styled.div((props) => ({
  margin: '0 -16px',
  height: 1,
  background: props.theme.colors.background.elevation6,
}));

const Body = styled.div((props) => ({
  marginTop: props.theme.spacing(8),
  marginBottom: props.theme.spacing(4),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(10),
}));

const Button = styled.div<{ isAction?: boolean }>((props) => ({
  cursor: 'pointer',
  display: 'flex',
  height: 44,
  padding: 12,
  justifyContent: 'center',
  alignItems: 'center',
  gap: 10,
  flex: '1 0 0',
  borderRadius: 8,
  marginLeft: props.isAction ? props.theme.spacing(6) : 0,
  border: props.isAction ? '' : `1px solid ${props.theme.colors.background.elevation6}`,
  background: props.isAction ? props.theme.colors.white[0] : 'inherit',
  color: props.isAction ? props.theme.colors.background.elevation0 : 'inherit',
}));

type ErrorType = InscriptionErrorCode | 'INVALID_JSON_CONTENT';

const END_ON_CLOSE_ERROR_CODES: ErrorType[] = [
  InscriptionErrorCode.CONTENT_TOO_BIG,
  InscriptionErrorCode.INSCRIPTION_VALUE_TOO_LOW,
  InscriptionErrorCode.INVALID_CONTENT,
  InscriptionErrorCode.INVALID_SERVICE_FEE_CONFIG,
];

const RESUBMIT_ERROR_CODES: ErrorType[] = [
  InscriptionErrorCode.FAILED_TO_FINALIZE,
  InscriptionErrorCode.SERVER_ERROR,
];

type Props = {
  errorCode?: ErrorType;
  onRetrySubmit?: () => void;
  onEnd: () => void;
};

function ErrorModal({ errorCode, onRetrySubmit, onEnd }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'INSCRIPTION_REQUEST.ERRORS' });
  const [display, setDisplay] = useState(true);

  if (!display || !errorCode) {
    return null;
  }

  const onClose = () => {
    if (END_ON_CLOSE_ERROR_CODES.includes(errorCode)) {
      onEnd();
    } else {
      setDisplay(false);
    }
  };

  const canResubmit = RESUBMIT_ERROR_CODES.includes(errorCode);

  return (
    <Container>
      <CardContainer>
        <Title>
          {t('ERROR')}: {t(`SHORT.${errorCode}`)}
          <CloseTick src={CloseIcon} onClick={onClose} />
        </Title>
        <Rule />
        <Body>{t(`LONG.${errorCode}`)}</Body>
        <ButtonContainer>
          <Button onClick={onClose}>{t('CLOSE')}</Button>
          {canResubmit && (
            <Button isAction onClick={onRetrySubmit}>
              {t('TRY_AGAIN')}
            </Button>
          )}
        </ButtonContainer>
      </CardContainer>
    </Container>
  );
}

export default ErrorModal;
