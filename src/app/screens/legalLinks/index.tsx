import LinkIcon from '@assets/img/linkIcon.svg';
import ActionButton from '@components/button';
import Separator from '@components/separator';
import useWalletSelector from '@hooks/useWalletSelector';
import { CustomSwitch } from '@screens/ledger/importLedgerAccount/steps/index.styled';
import { changeShowDataCollectionAlertAction } from '@stores/wallet/actions/actionCreators';
import { PRIVACY_POLICY_LINK, TERMS_LINK } from '@utils/constants';
import { saveIsTermsAccepted } from '@utils/localStorage';
import { optInMixPanel, optOutMixPanel } from '@utils/mixpanel';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

const Container = styled.div((props) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: props.theme.spacing(8),
  paddingTop: props.theme.spacing(28),
  paddingBottom: props.theme.spacing(28),
  justifyContent: 'space-between',
}));

const Title = styled.h1((props) => ({
  ...props.theme.bold_tile_text,
  color: props.theme.colors.white['0'],
}));

const SubTitle = styled.h1((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white['200'],
  marginTop: props.theme.spacing(8),
}));

const LinksContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(20),
}));

const Link = styled.a((props) => ({
  ...props.theme.body_m,
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(8),
  color: props.theme.colors.white['0'],
}));

const CustomizedLink = styled(Link)`
  transition: opacity 0.1s ease;
  :hover {
    opacity: 0.8;
  }
  :active {
    opacity: 1;
  }
`;

const SwitchContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: props.theme.spacing(8),
  fontSize: '0.875rem',
}));

const DataCollectionDescription = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(32),
}));

function LegalLinks() {
  const { t } = useTranslation('translation', { keyPrefix: 'LEGAL_SCREEN' });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedAccount } = useWalletSelector();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const [isToggleEnabled, setIsToggleEnabled] = useState(true);

  const handleSwitchToggle = () => setIsToggleEnabled((prevEnabledState) => !prevEnabledState);

  const handleLegalAccept = () => {
    if (isToggleEnabled) {
      optInMixPanel(selectedAccount?.masterPubKey);
    } else {
      optOutMixPanel();
    }
    dispatch(changeShowDataCollectionAlertAction(false));
    saveIsTermsAccepted(true);
    const isRestore = !!searchParams.get('restore');
    if (isRestore) {
      navigate('/restoreWallet', { replace: true });
    } else {
      navigate('/backup', { replace: true });
    }
  };
  return (
    <Container>
      <div>
        <Title>{t('SCREEN_TITLE')}</Title>
        <SubTitle>{t('SCREEN_SUBTITLE')}</SubTitle>
        <LinksContainer>
          <CustomizedLink href={TERMS_LINK} target="_blank">
            {t('TERMS_SERVICES_LINK_BUTTON')}
            <img src={LinkIcon} alt="terms" />
          </CustomizedLink>
          <Separator />
          <CustomizedLink href={PRIVACY_POLICY_LINK} target="_blank">
            {t('PRIVACY_POLICY_LINK_BUTTON')}
            <img src={LinkIcon} alt="privacy" />
          </CustomizedLink>
          <DataCollectionDescription>
            {t('AUTHORIZE_DATA_COLLECTION.DESCRIPTION')}
          </DataCollectionDescription>
          <SwitchContainer>
            <div>{t('AUTHORIZE_DATA_COLLECTION.TITLE')}</div>
            <CustomSwitch
              onColor={theme.colors.orange_main}
              offColor={theme.colors.background.elevation3}
              onChange={handleSwitchToggle}
              checked={isToggleEnabled}
              uncheckedIcon={false}
              checkedIcon={false}
            />
          </SwitchContainer>
        </LinksContainer>
      </div>
      <ActionButton text={t('ACCEPT_LEGAL_BUTTON')} onPress={handleLegalAccept} />
    </Container>
  );
}

export default LegalLinks;
