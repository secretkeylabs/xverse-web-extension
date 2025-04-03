import { StyledP } from '@ui-library/common.styled';
import { CrossButtonInline } from '@ui-library/crossButton';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
            const filteredParams = new URLSearchParams(searchParams);
            // these two params are used when address is selected from address book
            // so we need to remove them when the address is removed
            filteredParams.delete('address');
            filteredParams.delete('source');
            navigate(`${location.pathname}?${filteredParams.toString()}`, {
              replace: true,
            });
          }}
        />
      </AddressBookItemContainer>
    </>
  );
}

export default SelectedRecipient;
