import { AddressTypeSelectors } from '@components/preferredBtcAddress';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { Container, SubTitle, Title } from '@screens/settings/index.styles';
import Button from '@ui-library/button';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ButtonContainer = styled.div`
  margin: ${(props) => props.theme.space.m};
`;

function PaymentAddressTypeSelector() {
  const { t } = useTranslation('translation', {
    keyPrefix: 'SETTING_SCREEN.PREFERRED_BTC_ADDRESS',
  });
  const { t: tSettings } = useTranslation('translation', {
    keyPrefix: 'SETTING_SCREEN',
  });
  const { btcPaymentAddressType } = useWalletSelector();
  const { changeBtcPaymentAddressType } = useWalletReducer();
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState(btcPaymentAddressType);

  const handleOnCancelClick = () => {
    navigate(-1);
  };

  const onSave = () => {
    if (selectedType !== btcPaymentAddressType) {
      changeBtcPaymentAddressType(selectedType);
      toast(t('SUCCESS'));
    }
    navigate(-1);
  };

  return (
    <>
      <TopRow onClick={handleOnCancelClick} />
      <Container>
        <Title>{t('TITLE')} </Title>
        <SubTitle>{t('DESCRIPTION')}</SubTitle>
        <AddressTypeSelectors selectedType={selectedType} setSelectedType={setSelectedType} />
      </Container>
      <ButtonContainer>
        <Button
          title={tSettings('SAVE')}
          onClick={onSave}
          disabled={selectedType === btcPaymentAddressType}
        />
      </ButtonContainer>
      <BottomTabBar tab="settings" />
    </>
  );
}

export default PaymentAddressTypeSelector;
