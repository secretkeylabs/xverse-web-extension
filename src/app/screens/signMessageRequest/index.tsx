import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import { sendSignMessageSuccessResponseMessage } from '@common/utils/rpc/responseMessages/bitcoin';
import { sendUserRejectionMessage } from '@common/utils/rpc/responseMessages/errors';
import AccountHeaderComponent from '@components/accountHeader';
import MessageSigning from '@components/messageSigning';
import RequestError from '@components/requests/requestError';
import { MessageSigningProtocols, type Return } from '@sats-connect/core';
import { finalizeMessageSignature } from '@screens/signatureRequest/utils';
import { bip0322Hash, legacyHash } from '@secretkeylabs/xverse-core';
import { useSignMessageRequestParams, useSignMessageValidation } from './useSignMessageRequest';

function SignMessageRequest() {
  const { payload, tabId, requestToken, requestId } = useSignMessageRequestParams();
  const { validationError, setValidationError } = useSignMessageValidation(payload);

  const cancelCallback = () => {
    if (requestToken) {
      finalizeMessageSignature({ requestPayload: requestToken, tabId: +tabId, data: 'cancel' });
    } else {
      sendUserRejectionMessage({
        tabId: +tabId,
        messageId: requestId,
      });
    }
    window.close();
  };

  const onSigned = async (signedMessage) => {
    if (requestToken) {
      const signingMessage = {
        source: MESSAGE_SOURCE,
        method: SatsConnectMethods.signMessageResponse,
        payload: {
          signMessageRequest: requestToken,
          signMessageResponse: signedMessage.signature,
        },
      };
      chrome.tabs.sendMessage(+tabId, signingMessage);
    } else {
      const signMessageResult: Return<'signMessage'> = {
        address: payload.address,
        messageHash:
          payload.protocol === MessageSigningProtocols.BIP322
            ? bip0322Hash(payload.message)
            : legacyHash(payload.message).toString('base64'),
        signature: signedMessage.signature,
        protocol: signedMessage.protocol,
      };
      sendSignMessageSuccessResponseMessage({
        tabId: +tabId,
        messageId: requestId,
        result: signMessageResult,
      });
    }
    window.close();
  };

  const onSignedError = (err) => {
    setValidationError({ error: (err as any).message });
  };

  if (validationError) {
    return <RequestError error={validationError.error} onClose={cancelCallback} />;
  }

  return (
    <MessageSigning
      address={payload.address}
      message={payload.message}
      protocol={payload.protocol as MessageSigningProtocols}
      onSigned={onSigned}
      onSignedError={onSignedError}
      onCancel={cancelCallback}
      header={<AccountHeaderComponent disableMenuOption disableAccountSwitch />}
    />
  );
}

export default SignMessageRequest;
