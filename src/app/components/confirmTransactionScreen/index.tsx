import ConfirmScreen from '@components/confirmScreen';
import SwapImage from '@assets/img/swap-illustration.svg';
import BNSImage from '@assets/img/bns-illustration.svg';
import NFTImage from '@assets/img/nft-illustration.svg';
import styled from 'styled-components';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

const headerImageMapping = {
  'purchase-asset': NFTImage,
  'buy-item': NFTImage,
  'buy-in-ustx': NFTImage,
  'name-preorder': BNSImage,
  'swap-x-for-y': SwapImage,
  'swap-helper': SwapImage,
};

const AdvanceSettingsButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'flex-end',
  backgroundColor: '#00000000',
  width: 150,
  height: 20,
  marginLeft: 16,
  color: props.theme.colors.white_0,
}));

const FeesContainer = styled.div(() => ({}));

type Props = { children: ReactNode; onConfirm: () => void; onCancel: () => void };

function ConfirmTransaction({ children, onConfirm, onCancel }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION_SCREEN' });

  return (
    <ConfirmScreen
      confirmText={t('CONFIRM_BUTTON')}
      cancelText={t('CANCEL_BUTTON')}
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={false}
    >
      <>
        {children}
        <FeesContainer>
          {/* <FeesLabel />
          <Fees />
          <FiatFees /> */}
        </FeesContainer>
        <AdvanceSettingsButton>Advance settings</AdvanceSettingsButton>
      </>
    </ConfirmScreen>
  );
}

export default ConfirmTransaction;
