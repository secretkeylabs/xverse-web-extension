import { CrossButtonInline } from '@ui-library/crossButton';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from 'theme';

const AddressBookItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${(props) => props.theme.space.m};
  border: 1px solid ${(props) => props.theme.colors.white_800};
  border-radius: ${(props) => props.theme.radius(2)}px;
  background-color: #1e2024;
  padding: ${(props) => props.theme.space.m};
`;

function SelectedRecipient({
  setRecipientAddress,
  setToOwnAddress,
  children,
}: {
  setRecipientAddress: (address: string) => void;
  setToOwnAddress: (toOwnAddress: boolean) => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });

  return (
    <AddressBookItemContainer>
      {children}
      <CrossButtonInline
        size="ml"
        color={Theme.colors.white_0}
        ariaLabel={t('REMOVE_RECIPIENT')}
        onClick={() => {
          setRecipientAddress('');
          setToOwnAddress(false);
        }}
      />
    </AddressBookItemContainer>
  );
}

export default SelectedRecipient;
