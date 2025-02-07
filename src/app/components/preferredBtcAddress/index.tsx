import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import type { BtcPaymentType } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import AddressTypeSelector from './addressTypeSelector';

const AddressTypeContainer = styled.div((props) => ({
  marginTop: props.theme.space.l,
  marginBottom: props.theme.space.l,
}));

type AddressTypeSelectorProps = {
  selectedType: BtcPaymentType;
  setSelectedType: (type: BtcPaymentType) => void;
};

const AddressTypeSelectorsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.s};
`;

export function AddressTypeSelectors({ selectedType, setSelectedType }: AddressTypeSelectorProps) {
  const { t } = useTranslation('translation', {
    keyPrefix: 'SETTING_SCREEN.PREFERRED_BTC_ADDRESS',
  });
  const { btcAddresses } = useSelectedAccount();

  return (
    <AddressTypeSelectorsContainer>
      <AddressTypeSelector
        title={t('NATIVE_SEGWIT')}
        address={btcAddresses.native?.address}
        onClick={() => setSelectedType('native')}
        isSelected={selectedType === 'native'}
      />
      <AddressTypeSelector
        title={t('NESTED_SEGWIT')}
        address={btcAddresses.nested?.address}
        onClick={() => setSelectedType('nested')}
        isSelected={selectedType === 'nested'}
      />
    </AddressTypeSelectorsContainer>
  );
}

type PreferredAddressSheetProps = {
  visible: boolean;
  onSave: (newType: BtcPaymentType) => void;
  onCancel: () => void;
  currentType: BtcPaymentType;
};

function PreferredBtcAddressSheet({
  visible,
  onSave,
  onCancel,
  currentType,
}: PreferredAddressSheetProps) {
  const { t } = useTranslation('translation', {
    keyPrefix: 'SETTING_SCREEN.PREFERRED_BTC_ADDRESS',
  });
  const { t: tSettings } = useTranslation('translation', {
    keyPrefix: 'SETTING_SCREEN',
  });
  const [selectedType, setSelectedType] = useState(currentType);

  const onSaveHandler = () => {
    onSave(selectedType);
  };

  return (
    <Sheet title={t('TITLE')} visible={visible} onClose={onCancel}>
      <StyledP typography="body_m" color="white_200">
        {t('DESCRIPTION')}
      </StyledP>
      <AddressTypeContainer>
        <AddressTypeSelectors selectedType={selectedType} setSelectedType={setSelectedType} />
      </AddressTypeContainer>
      <Button
        title={tSettings('SAVE')}
        onClick={onSaveHandler}
        disabled={selectedType === currentType}
      />
    </Sheet>
  );
}

export function GlobalPreferredBtcAddressSheet({
  visible,
  onHide,
}: {
  visible: boolean;
  onHide: () => void;
}) {
  const { t: tSettings } = useTranslation('translation', {
    keyPrefix: 'SETTING_SCREEN.PREFERRED_BTC_ADDRESS',
  });

  const { changeBtcPaymentAddressType } = useWalletReducer();
  const { btcPaymentAddressType } = useWalletSelector();

  const onSaveAddressType = (newType: BtcPaymentType) => {
    if (newType !== btcPaymentAddressType) {
      changeBtcPaymentAddressType(newType);
      toast(tSettings('SUCCESS'));
    }
    onHide();
  };

  return (
    <PreferredBtcAddressSheet
      currentType={btcPaymentAddressType}
      onSave={onSaveAddressType}
      onCancel={onHide}
      visible={visible}
    />
  );
}
