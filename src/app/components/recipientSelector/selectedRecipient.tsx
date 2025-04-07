import { StyledP } from '@ui-library/common.styled';
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
  margin-top: ${(props) => props.theme.space.xs};
`;

function SelectedRecipient({
  setRecipientAddress,
  children,
}: {
  setRecipientAddress: (address: string) => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });

  return (
    <>
      <StyledP typography="body_medium_m" color="white_200">
        {t('RECIPIENT')}
      </StyledP>
      <AddressBookItemContainer>
        {children}
        <CrossButtonInline
          size="ml"
          color={Theme.colors.white_0}
          ariaLabel={t('REMOVE_RECIPIENT')}
          onClick={() => {
            setRecipientAddress('');
          }}
        />
      </AddressBookItemContainer>
    </>
  );
}

export default SelectedRecipient;
