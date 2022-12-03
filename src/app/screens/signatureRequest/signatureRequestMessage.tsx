import { SignaturePayload } from '@stacks/connect';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';

interface SignatureRequestMessageProps {
  request: SignaturePayload,
}

const ContentContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const RequestMessageTitle = styled.p((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white[200],
  marginBottom: props.theme.spacing(2),
  opacity: 0.7,
}));

const RequestMessage = styled.p((props) => ({
  ...props.theme.body_m,
  textAlign: 'left',
  lineHeight: 1.6,
  wordWrap: 'break-word',
  color: props.theme.colors.white[0],
  marginBottom: props.theme.spacing(4),
}));

export default function SignatureRequestMessage(props: SignatureRequestMessageProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'SIGNATURE_REQUEST' });
  const {
    request,
  } = props;

  return (
    <ContentContainer>
      <RequestMessageTitle>{t('MESSAGE_HEADER')}</RequestMessageTitle>
      {request.message.split(/\r?\n/).map((line) => (
        <RequestMessage key={line}>{line}</RequestMessage>
      ))}
    </ContentContainer>
  );
}
