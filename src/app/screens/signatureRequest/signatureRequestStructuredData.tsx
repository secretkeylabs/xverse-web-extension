import { hexToBytes } from '@noble/hashes/utils';
import { deserializeCV } from '@stacks/transactions';
import { useTranslation } from 'react-i18next';
import ClarityMessageView from './clarityMessageView';
import CollapsableContainer from './collapsableContainer';

interface SignatureRequestStructuredDataProps {
  /** Hex-encoded clarity value. */
  message: string;
}

export default function SignatureRequestStructuredData(props: SignatureRequestStructuredDataProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'SIGNATURE_REQUEST' });
  const { message } = props;
  return (
    <CollapsableContainer text="" title={t('MESSAGE_HEADER')}>
      <ClarityMessageView val={deserializeCV(hexToBytes(message))} encoding="tryAscii" />
    </CollapsableContainer>
  );
}
