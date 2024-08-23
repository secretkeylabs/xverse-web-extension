import { Check } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

const PermissionsTitle = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  textAlign: 'left',
  marginTop: 24,
}));

const Permission = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  marginTop: 12,
  display: 'flex',
  alignItems: 'center',
}));

const PermissionIcon = styled.div((props) => ({
  display: 'flex',
  marginRight: props.theme.space.xs,
}));

function PermissionsList() {
  const { t } = useTranslation('translation', { keyPrefix: 'SELECT_BTC_ADDRESS_SCREEN' });
  const theme = useTheme();
  return (
    <>
      <PermissionsTitle>{t('PERMISSIONS_TITLE')}</PermissionsTitle>
      <Permission>
        <PermissionIcon>
          <Check size={theme.space.m} color={theme.colors.success_light} weight="bold" />
        </PermissionIcon>
        {t('PERMISSION_WALLET_BALANCE')}
      </Permission>
      <Permission>
        <PermissionIcon>
          <Check size={theme.space.m} color={theme.colors.success_light} weight="bold" />
        </PermissionIcon>
        {t('PERMISSION_REQUEST_TX')}
      </Permission>
      <Permission>
        <PermissionIcon>
          <Check size={theme.space.m} color={theme.colors.success_light} weight="bold" />
        </PermissionIcon>
        {t('WALLET_TYPE_ACCESS')}
      </Permission>
    </>
  );
}

export default PermissionsList;
