import { StructuredDataSignaturePayload } from '@stacks/connect';
import { deserializeCV } from '@stacks/transactions/dist/esm/clarity';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ClarityMessageView from './clarityMessageView';
import CollapsableContainer from './collapsableContainer';

interface SignatureRequestStructuredDataProps {
  payload: StructuredDataSignaturePayload;
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

export default function SignatureRequestStructuredData(props: SignatureRequestStructuredDataProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'SIGNATURE_REQUEST' });
  const { payload } = props;
  return (
    <CollapsableContainer text='' title={t('MESSAGE_HEADER')}>
      <ClarityMessageView
        val={deserializeCV(Buffer.from(payload.message, 'hex'))}
        encoding="tryAscii"
      />
    </CollapsableContainer>
  );
}
