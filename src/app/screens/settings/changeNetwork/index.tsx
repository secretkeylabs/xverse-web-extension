import TopRow from '@components/topRow';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  defaultMainnet,
  defaultRegtest,
  defaultSignet,
  defaultTestnet,
  defaultTestnet4,
  initialNetworksList,
  type SettingsNetwork,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Input from '@ui-library/input';
import { isValidBtcApi, isValidStacksApi } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import NetworkRow from './networkRow';

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
  margin: ${(props) => props.theme.space.l};
`;

const NodeInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.xl};
  margin-top: ${(props) => props.theme.space.l};
`;

const NodeResetButton = styled.button`
  ${(props) => props.theme.typography.body_medium_m}
  background: none;
  color: ${(props) => props.theme.colors.tangerine};
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
      navigate('/');
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
  const savedTestnet4 = savedNetworks.find((n) => n.type === 'Testnet4');
  const savedRegtest = savedNetworks.find((n) => n.type === 'Regtest');
  const savedSignet = savedNetworks.find((n) => n.type === 'Signet');

  return (
    <>
      <TopRow onClick={handleBackButtonClick} showBackButton={!isChangingNetwork} />
      <Container>
        <Title>{t('NETWORK')}</Title>
        <NetworkRow
          network={savedMainnet || defaultMainnet}
          isSelected={formInputs.type === 'Mainnet'}
          onNetworkSelected={onNetworkSelected}
          disabled={isChangingNetwork}
          showDivider
        />
        <NetworkRow
          network={savedTestnet || defaultTestnet}
          isSelected={formInputs.type === 'Testnet'}
          onNetworkSelected={onNetworkSelected}
          disabled={isChangingNetwork}
          showDivider
        />
        <NetworkRow
          network={savedTestnet4 || defaultTestnet4}
          isSelected={formInputs.type === 'Testnet4'}
          onNetworkSelected={onNetworkSelected}
          disabled={isChangingNetwork}
          showDivider
        />
        <NetworkRow
          network={savedSignet || defaultSignet}
          isSelected={formInputs.type === 'Signet'}
          onNetworkSelected={onNetworkSelected}
          disabled={isChangingNetwork}
          showDivider
        />
        <NetworkRow
          network={savedRegtest || defaultRegtest}
          isSelected={formInputs.type === 'Regtest'}
          onNetworkSelected={onNetworkSelected}
          disabled={isChangingNetwork}
          showDivider={false}
        />
        <NodeInputsContainer>
          {nodeInputs.map(({ key, labelKey }) => (
            <Input
              key={key}
              titleElement={t(labelKey)}
              data-testid={t(labelKey)}
              onChange={onChangeCreator(key)}
              value={formInputs[key]}
              disabled={isChangingNetwork}
              feedback={formErrors[key] ? [{ message: formErrors[key], variant: 'danger' }] : []}
              infoPanel={
                <NodeResetButton onClick={onResetCreator(key)} disabled={isChangingNetwork}>
                  {t('RESET_TO_DEFAULT')}
                </NodeResetButton>
              }
            />
          ))}
        </NodeInputsContainer>
      </Container>
      <ButtonContainer>
        <Button
          title={t('SAVE')}
          onClick={onSubmit}
          loading={isChangingNetwork}
          disabled={isChangingNetwork}
        />
      </ButtonContainer>
    </>
  );
}

export default ChangeNetworkScreen;
