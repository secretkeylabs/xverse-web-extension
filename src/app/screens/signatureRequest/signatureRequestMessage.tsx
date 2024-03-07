import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import CollapsableContainer from './collapsableContainer';

interface SignatureRequestMessageProps {
  message: string;
}

const RequestMessage = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  textAlign: 'left',
  wordWrap: 'break-word',
  color: props.theme.colors.white_0,
}));

export default function SignatureRequestMessage(props: SignatureRequestMessageProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'SIGNATURE_REQUEST' });
  const { message } = props;

  return (
    <CollapsableContainer text={message} title={t('MESSAGE_HEADER')}>
      {message.split(/\r?\n/).map((line) => (
        <RequestMessage key={line}>{line}</RequestMessage>
      ))}
    </CollapsableContainer>
  );
}
