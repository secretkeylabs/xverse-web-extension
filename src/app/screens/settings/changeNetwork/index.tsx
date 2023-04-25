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
import { isValidBtcApi, isValidStacksApi } from '@utils/helper';
import { SettingsNetwork, StacksMainnet, StacksTestnet } from '@secretkeylabs/xverse-core/types';
import useWalletReducer from '@hooks/useWalletReducer';
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

const NodeInputHeader = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingLeft: props.theme.spacing(1),
  paddingRight: props.theme.spacing(1),
}));

const NodeText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  marginTop: props.theme.spacing(6),
}));

const NodeResetButton = styled.button((props) => ({
  background: 'none',
  color: props.theme.colors.action.classicLight,
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
  const { network, btcApiUrl, networkAddress, hasActivatedDLCsKey } = useWalletSelector();
  const [changedNetwork, setChangedNetwork] = useState<SettingsNetwork>(network);
  const [error, setError] = useState<string>('');
  const [btcURLError, setBtcURLError] = useState('');
  const [btcUrl, setBtcUrl] = useState(btcApiUrl || network.btcApiUrl);
  const [url, setUrl] = useState<string>(networkAddress || network.address);
  const [isChangingNetwork, setIsChangingNetwork] = useState<boolean>(false);
  const [isUrlEdited, setIsUrlEdited] = useState(false);
  const navigate = useNavigate();
  const { changeNetwork } = useWalletReducer();

  const handleBackButtonClick = () => {
    navigate('/settings');
  };

  const onNetworkSelected = (networkSelected: SettingsNetwork) => {
    setIsUrlEdited(false);
    setUrl(networkSelected.address);
    setChangedNetwork(networkSelected);
    setBtcUrl(networkSelected.btcApiUrl);
    setError('');
    setBtcURLError('');
  };

  const onChangeStacksUrl = (event: React.FormEvent<HTMLInputElement>) => {
    setError('');
    setUrl(event.currentTarget.value);
  };

  const onChangeBtcApiUrl = (event: React.FormEvent<HTMLInputElement>) => {
    setBtcURLError('');
    setIsUrlEdited(true);
    setBtcUrl(event.currentTarget.value);
  };

  const onClearStacksUrl = () => {
    setUrl('');
  };

  const onClearBtcUrl = () => {
    setBtcUrl('');
  };

  const onResetBtcUrl = async () => {
    if (changedNetwork.type !== network.type) {
      setBtcUrl(changedNetwork.btcApiUrl);
    } else {
      setBtcUrl(network.btcApiUrl);
    }
    setBtcURLError('');
  };

  const onResetStacks = async () => {
    if (changedNetwork.type !== network.type) {
      setUrl(changedNetwork.address);
    } else {
      setUrl(networkAddress || network.address);
    }
    setError('');
  };

  const onSubmit = async () => {
    setIsChangingNetwork(true);
    const isValidStacksUrl = await isValidStacksApi(url, changedNetwork.type).catch((err) => setError(err.message));
    const isValidBtcApiUrl = await isValidBtcApi(btcUrl, changedNetwork.type).catch((err) => setBtcURLError(err.message));
    if (isValidStacksUrl && isValidBtcApiUrl) {
      const networkObject =
        changedNetwork.type === 'Mainnet' ? new StacksMainnet({ url }) : new StacksTestnet({ url });
      const btcChangedUrl = isUrlEdited ? btcUrl : '';
      await changeNetwork(changedNetwork, networkObject, url, btcChangedUrl);
      navigate('/settings');
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
        {hasActivatedDLCsKey && (
          <NetworkRow
            network={initialNetworksList[2]}
            isSelected={changedNetwork.type === 'Regtest'}
            onNetworkSelected={onNetworkSelected}
            showDivider={false}
          />
        )}
        <NodeInputHeader>
          <NodeText>{t('NODE')}</NodeText>
          <NodeResetButton onClick={onResetStacks}>Reset URL</NodeResetButton>
        </NodeInputHeader>
        <InputContainer>
          <Input onChange={onChangeStacksUrl} value={url} />
          <Button onClick={onClearStacksUrl}>
            <img width={22} height={22} src={Cross} alt="cross" />
          </Button>
        </InputContainer>
        <ErrorMessage>{error}</ErrorMessage>
        <NodeInputHeader>
          <NodeText>BTC API URL</NodeText>
          <NodeResetButton onClick={onResetBtcUrl}>
            Reset URL
          </NodeResetButton>
        </NodeInputHeader>
        <InputContainer>
          <Input onChange={onChangeBtcApiUrl} value={btcUrl} />
          <Button onClick={onClearBtcUrl}>
            <img width={22} height={22} src={Cross} alt="cross" />
          </Button>
        </InputContainer>
        <ErrorMessage>{btcURLError}</ErrorMessage>
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
