import { decodeToken } from 'jsontokens';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import AccountHeaderComponent from '@components/accountHeader';
import ConfirmScreen from '@components/confirmScreen';

import ContentLabel from './ContentLabel';

const MainContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  flex: 1,
  height: '100%',
}));

const Title = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginTop: props.theme.spacing(11),
  color: props.theme.colors.white[0],
  textAlign: 'left',
}));

const SubTitle = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  marginTop: props.theme.spacing(4),
  color: props.theme.colors.white[400],
  textAlign: 'left',
  marginBottom: props.theme.spacing(12),
}));

const CardContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.background.elevation1,
  borderRadius: 12,
  padding: '16px 16px',
  justifyContent: 'center',
  marginBottom: 12,
  fontSize: 14,
}));

type CardRowProps = {
  topMargin?: boolean;
};
const CardRow = styled.div<CardRowProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: props.topMargin ? props.theme.spacing(8) : 0,
}));

const OrdinalIconLabel = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ButtonIcon = styled.img((props) => ({
  width: 32,
  height: 32,
  marginRight: props.theme.spacing(4),
}));

const ErrorContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(24),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const ErrorText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.feedback.error,
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  width: '100%',
  marginTop: props.theme.spacing(10),
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

type Props = {
  type: 'text' | 'file';
};

function CreateInscription({ type }: Props) {
  const { t } = useTranslation('translation');
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestToken = params.get('createInscription');
  const request = decodeToken(requestToken as string);
  const tabId = params.get('tabId');

  const [showFeeSettings, setShowFeeSettings] = useState(false);

  const { contentType, network, recipientAddress, text, dataBase64 } = request.payload as any;

  const content = type === 'text' ? text : dataBase64;

  const isLoading = false;

  const confirmCallback = async () => {
    // try {
    //   setIsSigning(true);
    //   if (isHardwareAccount(selectedAccount)) {
    //     // setIsModalVisible(true);
    //     return;
    //   }
    //   if (!isSignMessageBip322) {
    //     const signature = await handleMessageSigning({
    //       message: payload.message,
    //       domain: domain || undefined,
    //     });
    //     if (signature) {
    //       finalizeMessageSignature({ requestPayload: request, tabId: +tabId, data: signature });
    //     }
    //   } else {
    //     const bip322signature = await handleBip322MessageSigning();
    //     const signingMessage = {
    //       source: MESSAGE_SOURCE,
    //       method: ExternalSatsMethods.signMessageResponse,
    //       payload: {
    //         signMessageRequest: request,
    //         signMessageResponse: bip322signature,
    //       },
    //     };
    //     chrome.tabs.sendMessage(+tabId, signingMessage);
    //     window.close();
    //   }
    // } catch (err) {
    //   console.log(err);
    // } finally {
    //   setIsSigning(false);
    // }
  };

  const cancelCallback = () => {
    // finalizeMessageSignature({ requestPayload: request, tabId: +tabId, data: 'cancel' });
    window.close();
  };

  const onAdvancedSettingClick = () => {
    setShowFeeSettings(true);
  };

  return (
    <ConfirmScreen
      onConfirm={confirmCallback}
      onCancel={cancelCallback}
      cancelText={t('INSCRIPTION_REQUEST.CANCEL_BUTTON')}
      confirmText={t('INSCRIPTION_REQUEST.CONFIRM_BUTTON')}
      loading={isLoading}
    >
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      <MainContainer>
        <Title>{t('INSCRIPTION_REQUEST.TITLE')}</Title>
        <SubTitle>{t('INSCRIPTION_REQUEST.SUBTITLE')}</SubTitle>
        <CardContainer>
          <CardRow>
            <div>{t('INSCRIPTION_REQUEST.SUMMARY.TITLE')}</div>
          </CardRow>
          <CardRow topMargin>
            <OrdinalIconLabel>
              <div>
                <ButtonIcon src={OrdinalsIcon} />
              </div>
              <div>{t('INSCRIPTION_REQUEST.SUMMARY.ORDINAL')}</div>
            </OrdinalIconLabel>
            <ContentLabel contentType={contentType} content={content} type={type} />
          </CardRow>
        </CardContainer>
        <CardContainer>
          <CardRow>
            <div>{t('INSCRIPTION_REQUEST.NETWORK')}</div>
            <div>{network.type}</div>
          </CardRow>
        </CardContainer>
        <CardContainer>
          <CardRow>
            <div>{t('INSCRIPTION_REQUEST.VALUE')}</div>
            <div>To Calc Bitcoin Value</div>
          </CardRow>
        </CardContainer>
        <CardContainer>
          <CardRow>
            <div>{t('INSCRIPTION_REQUEST.FEES.TITLE')}</div>
          </CardRow>
          <CardRow>
            <div>{t('INSCRIPTION_REQUEST.FEES.INSCRIPTION')}</div>
            <div>To Calc INSCRIPTION/SERVICE (ours plus from payload)</div>
          </CardRow>
          <CardRow>
            <div>{t('INSCRIPTION_REQUEST.FEES.TRANSACTION')}</div>
            <div>To Calc TXN</div>
          </CardRow>
          <CardRow>
            <div>{t('INSCRIPTION_REQUEST.FEES.TOTAL')}</div>
            <div>To Calc TOTAL fees</div>
          </CardRow>
        </CardContainer>
        <Button onClick={onAdvancedSettingClick}>
          <ButtonImage src={SettingIcon} />
          <ButtonText>{t('INSCRIPTION_REQUEST.EDIT_FEES')}</ButtonText>
        </Button>
        <ErrorContainer>
          <ErrorText>error</ErrorText>
        </ErrorContainer>
      </MainContainer>
    </ConfirmScreen>
  );
}

export default CreateInscription;
