import LinkIcon from '@assets/img/linkIcon.svg';
import Separator from '@components/separator';
import useWalletReducer from '@hooks/useWalletReducer';
import Button from '@ui-library/button';
import Toggle from '@ui-library/toggle';
import { PRIVACY_POLICY_LINK, TERMS_LINK } from '@utils/constants';
import { saveIsTermsAccepted } from '@utils/localStorage';
import { optInMixPanel, optOutMixPanel } from '@utils/mixpanel';
import RoutePaths from 'app/routes/paths';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: props.theme.spacing(8),
  paddingTop: props.theme.spacing(20),
  paddingBottom: props.theme.spacing(32),
  justifyContent: 'space-between',
}));

const Title = styled.h1((props) => ({
  ...props.theme.bold_tile_text,
  color: props.theme.colors.white_0,
}));

const SubTitle = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(8),
}));

const LinksContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(20),
}));

const Link = styled.a((props) => ({
  ...props.theme.typography.body_medium_m,
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(8),
  color: props.theme.colors.white_0,
}));

const CustomizedLink = styled(Link)`
  transition: opacity 0.1s ease;
  cursor: pointer;
  :hover,
  &:focus {
    opacity: 0.8;
  }
  :active {
    opacity: 1;
  }
`;

const SwitchContainer = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: props.theme.spacing(8),
  fontSize: '0.875rem',
}));

const DataCollectionDescription = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(32),
}));

function Legal() {
  const { t } = useTranslation('translation', { keyPrefix: 'LEGAL_SCREEN' });
  const navigate = useNavigate();
  const { changeShowDataCollectionAlert } = useWalletReducer();
  const [searchParams] = useSearchParams();
  const [isToggleEnabled, setIsToggleEnabled] = useState(true);

  const handleSwitchToggle = () => setIsToggleEnabled((prevEnabledState) => !prevEnabledState);

  const handleLegalAccept = async () => {
    if (isToggleEnabled) {
      optInMixPanel();
    } else {
      optOutMixPanel();
    }

    changeShowDataCollectionAlert();
    saveIsTermsAccepted(true);
    const isRestore = !!searchParams.get('restore');
    if (isRestore) {
      navigate(RoutePaths.RestoreWallet, { replace: true });
    } else {
      navigate(RoutePaths.CreateWallet, { replace: true });
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
            <Toggle onChange={handleSwitchToggle} checked={isToggleEnabled} />
          </SwitchContainer>
        </LinksContainer>
      </div>
      <Button title={t('ACCEPT_LEGAL_BUTTON')} onClick={handleLegalAccept} />
    </Container>
  );
}

export default Legal;
