import MessageSigning from '@components/messageSigning';
import TopRow from '@components/topRow';
import useRunesApi from '@hooks/apiClients/useRunesApi';
import useXverseApi from '@hooks/apiClients/useXverseApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { MessageSigningProtocols } from '@sats-connect/core';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

function SignRuneDelistingMessage() {
  const { t } = useTranslation('translation');
  const runesApi = useRunesApi();
  const xverseApi = useXverseApi();
  const selectedAccount = useSelectedAccount();
  const location = useLocation();
  const navigate = useNavigate();

  const { payload } = location.state?.requestPayload || {};

  const handleGoBack = () => navigate(-2);

  const onSigned = async (signedMessage) => {
    if (payload.marketplace === 'OKX') {
      await xverseApi.listings.submitRuneCancelOrder({
        cancellationsPerMarketplace: [
          {
            marketplace: payload.marketplace,
            orderId: payload.orderIds[0],
            type: 'withMessage',
            token: payload.token,
            signature: signedMessage.signature,
          },
        ],
      });
    } else {
      await runesApi.submitCancelRunesSellOrder({
        orderIds: payload.orderIds,
        makerPublicKey: selectedAccount?.ordinalsPublicKey!,
        makerAddress: selectedAccount?.ordinalsAddress!,
        token: payload.token,
        signature: signedMessage.signature,
      });
    }

    handleGoBack();
    toast(`${t('SIGNATURE_REQUEST.UNLISTED_SUCCESS')}`);
  };

  const onSignedError = () => {
    toast(`${t('SIGNATURE_REQUEST.UNLISTED_ERROR')}`);
  };

  const handleCancelClick = () => {
    navigate(`/coinDashboard/FT?ftKey=${payload.selectedRuneId}&protocol=runes`);
  };

  return (
    <MessageSigning
      address={selectedAccount.ordinalsAddress}
      message={payload.message}
      protocol={MessageSigningProtocols.BIP322}
      onSigned={onSigned}
      onSignedError={onSignedError}
      onCancel={handleCancelClick}
      header={<TopRow onClick={handleGoBack} />}
    />
  );
}

export default SignRuneDelistingMessage;
