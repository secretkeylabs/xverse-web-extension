import { SignaturePayload } from '@stacks/connect';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import CollapsableContainer from './collapsableContainer';

interface SignatureRequestMessageProps {
  request: SignaturePayload;
}

const RequestMessage = styled.p((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  wordWrap: 'break-word',
  color: props.theme.colors.white_0,
}));

export default function SignatureRequestMessage(props: SignatureRequestMessageProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'SIGNATURE_REQUEST' });
  const { request } = props;

  return (
    <CollapsableContainer text={request.message} title={t('MESSAGE_HEADER')}>
      {request.message.split(/\r?\n/).map((line) => (
        <RequestMessage key={line}>{line}</RequestMessage>
      ))}
    </CollapsableContainer>
  );
}
