import { StructuredDataSignaturePayload } from '@stacks/connect';
import { deserializeCV } from '@stacks/transactions/dist/esm/clarity';
import { useTranslation } from 'react-i18next';
import ClarityMessageView from './clarityMessageView';
import CollapsableContainer from './collapsableContainer';

interface SignatureRequestStructuredDataProps {
  payload: StructuredDataSignaturePayload;
}

export default function SignatureRequestStructuredData(props: SignatureRequestStructuredDataProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'SIGNATURE_REQUEST' });
  const { payload } = props;
  return (
    <CollapsableContainer text="" title={t('MESSAGE_HEADER')}>
      <ClarityMessageView
        val={deserializeCV(Buffer.from(payload.message, 'hex'))}
        encoding="tryAscii"
      />
    </CollapsableContainer>
  );
}
