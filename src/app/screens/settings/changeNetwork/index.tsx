import ActionButton from '@components/button';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  SettingsNetwork,
  defaultMainnet,
  defaultTestnet,
  initialNetworksList,
} from '@secretkeylabs/xverse-core';
import { isValidBtcApi, isValidStacksApi } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import NetworkRow from './networkRow';
import NodeInput from './nodeInput';

const Container = styled.div`
  ${(props) => props.theme.typography.body_medium_m}
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

const ButtonContainer = styled.div`
  margin: ${(props) => props.theme.space.m};
`;

const NodeInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.s};
  margin-top: ${(props) => props.theme.space.s};
`;

type NodeInputKey = keyof Pick<SettingsNetwork, 'address' | 'btcApiUrl' | 'fallbackBtcApiUrl'>;
const nodeInputs: { key: NodeInputKey; labelKey: string }[] = [
  { key: 'address', labelKey: 'STACKS_URL' },
  { key: 'btcApiUrl', labelKey: 'BTC_URL' },
  { key: 'fallbackBtcApiUrl', labelKey: 'FALLBACK_BTC_URL' },
];

type NodeInputErrors = Record<NodeInputKey, string>;
const initialNodeErrors: NodeInputErrors = {
  address: '',
  btcApiUrl: '',
  fallbackBtcApiUrl: '',
};

function ChangeNetworkScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const navigate = useNavigate();
  const { changeNetwork } = useWalletReducer();
  const { network, savedNetworks } = useWalletSelector();
  const [isChangingNetwork, setIsChangingNetwork] = useState(false);
  const [formErrors, setFormErrors] = useState<NodeInputErrors>(initialNodeErrors);
  const [formInputs, setFormInputs] = useState<SettingsNetwork>(network);

  const handleBackButtonClick = () => {
    navigate('/settings');
  };

  const onNetworkSelected = (networkSelected: SettingsNetwork) => {
    setFormInputs(networkSelected);
    setFormErrors(initialNodeErrors);
  };

  // TODO should validate required fields on change
  const onChangeFactory = (key: NodeInputKey) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [key]: '',
    }));
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      [key]: event.target.value,
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
      [key]: initialNetworksList.find((n) => n.type === formInputs.type)?.[key],
    }));
  };

  const onSubmit = async () => {
    setIsChangingNetwork(true);

    if (!formInputs.address) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        address: t('REQUIRED'),
      }));
      setIsChangingNetwork(false);
      return;
    }

    if (!formInputs.btcApiUrl) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        btcApiUrl: t('REQUIRED'),
      }));
      setIsChangingNetwork(false);
      return;
    }

    const [isValidStacksUrl, isValidBtcApiUrl, isValidFallbackBtcApiUrl] = await Promise.all([
      isValidStacksApi(formInputs.address, formInputs.type),
      isValidBtcApi(formInputs.btcApiUrl, formInputs.type),
      !formInputs.fallbackBtcApiUrl || isValidBtcApi(formInputs.fallbackBtcApiUrl, formInputs.type),
    ]);

    if (isValidStacksUrl && isValidBtcApiUrl && isValidFallbackBtcApiUrl) {
      await changeNetwork(formInputs);
      navigate('/settings');
    } else {
      setFormErrors({
        address: !isValidStacksUrl ? t('INVALID_URL') : '',
        btcApiUrl: !isValidBtcApiUrl ? t('INVALID_URL') : '',
        fallbackBtcApiUrl: !isValidFallbackBtcApiUrl ? t('INVALID_URL') : '',
      });
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
          isSelected={formInputs.type === 'Mainnet'}
          onNetworkSelected={onNetworkSelected}
          showDivider
        />
        <NetworkRow
          network={savedTestnet || defaultTestnet}
          isSelected={formInputs.type === 'Testnet'}
          onNetworkSelected={onNetworkSelected}
          showDivider={false}
        />
        <NodeInputsContainer>
          {nodeInputs.map(({ key, labelKey }) => (
            <NodeInput
              key={key}
              label={t(labelKey)}
              onChange={onChangeFactory(key)}
              value={formInputs[key]}
              onClear={onClearFactory(key)}
              onReset={onResetFactory(key)}
              error={formErrors[key]}
            />
          ))}
        </NodeInputsContainer>
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
