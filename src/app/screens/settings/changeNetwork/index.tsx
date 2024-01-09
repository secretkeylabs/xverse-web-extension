import ActionButton from '@components/button';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { defaultMainnet, defaultTestnet, SettingsNetwork } from '@secretkeylabs/xverse-core';
import { isValidBtcApi, isValidStacksApi } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import NetworkRow from './networkRow';
import NodeInput from './nodeInput';

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

const ButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(16),
}));

type NodeInputKey = 'stacksUrl' | 'btcUrl' | 'fallbackBtcUrl';
const nodeInputKeys: NodeInputKey[] = ['stacksUrl', 'btcUrl', 'fallbackBtcUrl'];

function ChangeNetworkScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const { network, savedNetworks } = useWalletSelector();
  const [changedNetwork, setChangedNetwork] = useState<SettingsNetwork>(network);
  const [isChangingNetwork, setIsChangingNetwork] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<NodeInputKey, string>>({
    stacksUrl: '',
    btcUrl: '',
    fallbackBtcUrl: '',
  });

  const [formInputs, setFormInputs] = useState<Record<NodeInputKey, string>>({
    stacksUrl: network.address,
    btcUrl: network.btcApiUrl,
    fallbackBtcUrl: network.fallbackBtcApiUrl,
  });

  const navigate = useNavigate();
  const { changeNetwork } = useWalletReducer();

  const handleBackButtonClick = () => {
    navigate('/settings');
  };

  const onNetworkSelected = (networkSelected: SettingsNetwork) => {
    setChangedNetwork(networkSelected);
    setFormInputs({
      stacksUrl: networkSelected.address,
      btcUrl: networkSelected.btcApiUrl,
      fallbackBtcUrl: networkSelected.fallbackBtcApiUrl,
    });
    setFormErrors({
      stacksUrl: '',
      btcUrl: '',
      fallbackBtcUrl: '',
    });
  };

  const onChangeFactory = (key: NodeInputKey) => (event: React.FormEvent<HTMLInputElement>) => {
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [key]: '',
    }));
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      [key]: event.currentTarget.value,
    }));
  };

  const onClearFactory = (key: NodeInputKey) => () => {
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [key]: '',
    }));
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      [key]: '',
    }));
  };

  const onResetFactory = (key: NodeInputKey) => () => {
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [key]: '',
    }));
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      [key]: changedNetwork[key],
    }));
  };

  const onSubmit = async () => {
    setIsChangingNetwork(true);

    const [isValidStacksUrl, isValidBtcApiUrl, isValidFallbackBtcApiUrl] = await Promise.all([
      isValidStacksApi(changedNetwork.address, changedNetwork.type),
      isValidBtcApi(changedNetwork.btcApiUrl, changedNetwork.type),
      isValidBtcApi(changedNetwork.fallbackBtcApiUrl, changedNetwork.type),
    ]);

    if (isValidStacksUrl && isValidBtcApiUrl && isValidFallbackBtcApiUrl) {
      await changeNetwork(changedNetwork);
      navigate('/settings');
    } else {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        stacksUrl: !isValidStacksUrl ? t('INVALID_URL') : '',
        btcUrl: !isValidBtcApiUrl ? t('INVALID_URL') : '',
        fallbackBtcUrl: !isValidFallbackBtcApiUrl ? t('INVALID_URL') : '',
      }));
      setIsChangingNetwork(false);
    }
  };

  const savedMainnet = savedNetworks.find((n) => n.type === 'Mainnet');
  const savedTestnet = savedNetworks.find((n) => n.type === 'Testnet');

  return (
    <>
      <TopRow title={t('NETWORK')} onClick={handleBackButtonClick} />
      <Container>
        <NetworkRow
          network={savedMainnet || defaultMainnet}
          isSelected={changedNetwork.type === 'Mainnet'}
          onNetworkSelected={onNetworkSelected}
          showDivider
        />
        <NetworkRow
          network={savedTestnet || defaultTestnet}
          isSelected={changedNetwork.type === 'Testnet'}
          onNetworkSelected={onNetworkSelected}
          showDivider={false}
        />
        {nodeInputKeys.map((key) => (
          <NodeInput
            key={key}
            label={t(key)}
            onChange={onChangeFactory(key)}
            value={formInputs[key]}
            onClear={onClearFactory(key)}
            onReset={onResetFactory(key)}
            error={formErrors[key]}
          />
        ))}
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
