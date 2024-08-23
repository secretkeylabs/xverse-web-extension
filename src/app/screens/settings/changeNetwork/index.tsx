import ActionButton from '@components/button';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  defaultMainnet,
  defaultSignet,
  defaultTestnet,
  initialNetworksList,
  type SettingsNetwork,
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

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  paddingTop: props.theme.space.xs,
  paddingBottom: props.theme.space.s,
}));

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
    if (networkSelected.type === formInputs.type) {
      return;
    }
    setFormInputs(networkSelected);
    setFormErrors(initialNodeErrors);
  };

  // TODO should validate required fields on change
  const onChangeCreator = (key: NodeInputKey) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [key]: '',
    }));
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      [key]: event.target.value,
    }));
  };

  const onClearCreator = (key: NodeInputKey) => () => {
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [key]: '',
    }));
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      [key]: '',
    }));
  };

  const onResetCreator = (key: NodeInputKey) => () => {
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

    // TODO use formik/yup for all validation if form gets more complex
    // validate required fields
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

    const isChangedStacksUrl = formInputs.address !== network.address;
    const isChangedBtcApiUrl = formInputs.btcApiUrl !== network.btcApiUrl;
    const isChangedFallbackBtcApiUrl = formInputs.fallbackBtcApiUrl !== network.fallbackBtcApiUrl;

    // validate against server if inputs were changed
    const [isValidStacksUrl, isValidBtcApiUrl, isValidFallbackBtcApiUrl] = await Promise.all([
      !isChangedStacksUrl || isValidStacksApi(formInputs.address, formInputs.type),
      !isChangedBtcApiUrl || isValidBtcApi(formInputs.btcApiUrl, formInputs.type),
      !formInputs.fallbackBtcApiUrl ||
        !isChangedFallbackBtcApiUrl ||
        isValidBtcApi(formInputs.fallbackBtcApiUrl, formInputs.type),
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
  const savedSignet = savedNetworks.find((n) => n.type === 'Signet');

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <Title>{t('NETWORK')}</Title>
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
          showDivider
        />
        <NetworkRow
          network={savedSignet || defaultSignet}
          isSelected={formInputs.type === 'Signet'}
          onNetworkSelected={onNetworkSelected}
          showDivider={false}
        />
        <NodeInputsContainer>
          {nodeInputs.map(({ key, labelKey }) => (
            <NodeInput
              key={key}
              label={t(labelKey)}
              onChange={onChangeCreator(key)}
              value={formInputs[key]}
              onClear={onClearCreator(key)}
              onReset={onResetCreator(key)}
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
