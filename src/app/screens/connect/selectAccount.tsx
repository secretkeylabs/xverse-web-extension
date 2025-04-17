import KeystoneBadge from '@assets/img/hw/keystone/keystone_badge.svg';
import LedgerBadge from '@assets/img/hw/ledger/ledger_badge.svg';
import { CaretRight } from '@phosphor-icons/react';
import type { Account } from '@secretkeylabs/xverse-core';
import { getAccountGradient } from '@utils/gradient';
import { getAccountName, isKeystoneAccount, isLedgerAccount } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

const AccountInfoContainer = styled.button((props) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: 12,
  border: `1px solid ${props.theme.colors.white_850}`,
  backgroundColor: props.theme.colors.elevation6_800,
  padding: props.theme.space.m,
}));

const CurrentAccountContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
});

const CurrentAccountTextContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: props.theme.spacing(4),
  paddingLeft: props.theme.space.xs,
}));

const CurrentAccountName = styled.span((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  textAlign: 'start',
  maxWidth: 160,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const GradientCircle = styled.div<{
  firstGradient: string;
  secondGradient: string;
  thirdGradient: string;
}>((props) => ({
  width: 20,
  height: 20,
  borderRadius: '50%',
  background: `linear-gradient(to bottom,${props.firstGradient}, ${props.secondGradient},${props.thirdGradient} )`,
}));

const AccountTag = styled.div(() => ({
  display: 'flex',
  alignItems: 'center',
}));

const SwitchAccountContainer = styled.div(() => ({
  display: 'flex',
  alignItems: 'center',
}));

const SwitchAccountText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  marginRight: props.theme.space.xs,
  textAlign: 'start',
}));

type Props = {
  account: Account;
  handlePressAccount: () => void;
};

function SelectAccount({ account, handlePressAccount }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SELECT_BTC_ADDRESS_SCREEN' });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'COMMON' });

  const theme = useTheme();
  const gradient = getAccountGradient(account);

  return (
    <AccountInfoContainer onClick={handlePressAccount}>
      <CurrentAccountContainer>
        <AccountTag>
          <GradientCircle
            firstGradient={gradient[0]}
            secondGradient={gradient[1]}
            thirdGradient={gradient[2]}
          />
          {account && (
            <CurrentAccountTextContainer>
              <CurrentAccountName>{getAccountName(account, tCommon)}</CurrentAccountName>
              {isLedgerAccount(account) && <img src={LedgerBadge} alt="Ledger icon" />}
              {isKeystoneAccount(account) && <img src={KeystoneBadge} alt="Keystone icon" />}
            </CurrentAccountTextContainer>
          )}
        </AccountTag>
      </CurrentAccountContainer>
      <SwitchAccountContainer>
        <SwitchAccountText>{t('CHANGE_ACCOUNT_BUTTON')}</SwitchAccountText>
        <CaretRight size={theme.space.m} color={theme.colors.white_0} />
      </SwitchAccountContainer>
    </AccountInfoContainer>
  );
}

export default SelectAccount;
