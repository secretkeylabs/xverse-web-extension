import { AddressBook as AddressBookIcon } from '@phosphor-icons/react';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import RoutePaths from 'app/routes/paths';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Theme from 'theme';

const PlaceholderContainer = styled.div({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  flex: 1,
});

const PlaceholderTitle = styled(StyledP)((props) => ({
  marginTop: props.theme.space.l,
  marginBottom: props.theme.space.xxs,
}));

const PlaceholderDescription = styled(StyledP)((props) => ({
  padding: `0 ${props.theme.space.xl}`,
}));

const PlaceholderButton = styled(Button)((props) => ({
  maxWidth: '120px',
  marginTop: props.theme.space.l,
}));

function AddressBookPlaceholder() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const navigate = useNavigate();

  return (
    <PlaceholderContainer>
      <AddressBookIcon size={40} weight="fill" color={Theme.colors.white_600} />
      <PlaceholderTitle typography="body_medium_l" color="white_0">
        {t('ADDRESS_BOOK.NO_ADDRESSES.TITLE')}
      </PlaceholderTitle>
      <PlaceholderDescription typography="body_m" color="white_400">
        {t('ADDRESS_BOOK.NO_ADDRESSES.DESCRIPTION')}
      </PlaceholderDescription>
      <PlaceholderButton
        title={t('ADDRESS_BOOK.ADD_ADDRESS.ADD_BUTTON')}
        onClick={() => navigate(RoutePaths.AddAddress)}
      />
    </PlaceholderContainer>
  );
}

export default AddressBookPlaceholder;
