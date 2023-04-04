import styled from 'styled-components';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import useWalletSelector from '@hooks/useWalletSelector';
import { useNavigate } from 'react-router-dom';
import { initialNetworksList } from '@utils/constants';
import Cross from '@assets/img/settings/x.svg';
import { useState } from 'react';
import ActionButton from '@components/button';
import { isValidURL } from '@utils/helper';
import { SettingsNetwork, StacksMainnet, StacksTestnet } from '@secretkeylabs/xverse-core/types';
import useWalletReducer from '@hooks/useWalletReducer';
import useNetworkSelector from '@hooks/useNetwork';
import NetworkRow from './networkRow';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const NodeText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  marginTop: props.theme.spacing(6),
}));

const InputContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  border: `1px solid ${props.theme.colors.background.elevation3}`,
  backgroundColor: props.theme.colors.background['elevation-1'],
  borderRadius: props.theme.radius(1),
  paddingLeft: props.theme.spacing(4),
  paddingRight: props.theme.spacing(4),
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(3),
}));

const ButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(16),
}));

const ErrorMessage = styled.h2((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  color: props.theme.colors.feedback.error,
}));

const Input = styled.input((props) => ({
  ...props.theme.body_medium_m,
  height: 44,
  display: 'flex',
  flex: 1,
  backgroundColor: props.theme.colors.background['elevation-1'],
  color: props.theme.colors.white['0'],
  border: 'none',
}));

const Button = styled.button({
  background: 'none',
});

function ChangeNetworkScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const { network } = useWalletSelector();
  const selectedNetwork = useNetworkSelector();
  const [changedNetwork, setChangedNetwork] = useState<SettingsNetwork>(network);
  const [error, setError] = useState<string>('');
  const [url, setUrl] = useState<string>(selectedNetwork.coreApiUrl);
  const [isChangingNetwork, setIsChangingNetwork] = useState<boolean>(false);
  const navigate = useNavigate();
  const { changeNetwork } = useWalletReducer();

  const handleBackButtonClick = () => {
    navigate('/settings');
  };

  const onNetworkSelected = (networkSelected: SettingsNetwork) => {
    setUrl(networkSelected.address);
    setChangedNetwork(networkSelected);
  };

  const onChange = (event: React.FormEvent<HTMLInputElement>) => {
    setUrl(event.currentTarget.value);
  };

  const onCrossClick = () => {
    setUrl('');
  };

  const onSubmit = async () => {
    setIsChangingNetwork(true);
    const response = await isValidURL(url);
    if (response) {
      const networkObject =
        changedNetwork.type === 'Mainnet' ? new StacksMainnet({ url }) : new StacksTestnet({ url });
      await changeNetwork(changedNetwork, networkObject, url);
      navigate('/settings');
    } else {
      setError(t('INVALID_URL'));
    }
    setIsChangingNetwork(false);
  };

  return (
    <>
      <TopRow title={t('NETWORK')} onClick={handleBackButtonClick} />
      <Container>
        <NetworkRow
          network={initialNetworksList[0]}
          isSelected={changedNetwork.type === 'Mainnet'}
          onNetworkSelected={onNetworkSelected}
          showDivider
        />
        <NetworkRow
          network={initialNetworksList[1]}
          isSelected={changedNetwork.type === 'Testnet'}
          onNetworkSelected={onNetworkSelected}
          showDivider={false}
        />
        <NodeText>{t('NODE')}</NodeText>
        <InputContainer>
          <Input onChange={onChange} value={url} />
          <Button onClick={onCrossClick}>
            <img width={22} height={22} src={Cross} alt="cross" />
          </Button>
        </InputContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
      <ButtonContainer>
        <ActionButton
          text={t('SAVE')}
          onPress={onSubmit}
          processing={isChangingNetwork}
          disabled={isChangingNetwork}
        />
      </ButtonContainer>

      <BottomBar tab="settings" />
    </>
  );
}

export default ChangeNetworkScreen;
