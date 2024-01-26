import { CaretRight } from '@phosphor-icons/react';
import { Account } from '@secretkeylabs/xverse-core';
import { getAccountGradient } from '@utils/gradient';
import { isHardwareAccount } from '@utils/helper';
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

const CurrentSelectedAccountText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  textAlign: 'start',
  paddingLeft: props.theme.space.xs,
}));

interface GradientCircleProps {
  firstGradient: string;
  secondGradient: string;
  thirdGradient: string;
}
const GradientCircle = styled.div<GradientCircleProps>((props) => ({
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

type SelectAccountProps = {
  account: Account;
  handlePressAccount: () => void;
};

function SelectAccount({ account, handlePressAccount }: SelectAccountProps) {
  const gradient = getAccountGradient(account?.stxAddress || account?.btcAddress!);
  // const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const { t } = useTranslation('translation', { keyPrefix: 'SELECT_BTC_ADDRESS_SCREEN' });
  const theme = useTheme();
  const getName = () => {
    const maxNameCharacters = isHardwareAccount(account) ? 12 : 20;
    const maxLength =
      account?.accountName && account?.accountName?.length > maxNameCharacters ? '....' : '';
    if (account.accountName) {
      return `${account?.accountName?.slice(0, 20)}${maxLength}`;
    }
    if (account.bnsName) {
      return account.bnsName;
    }
    return `${t('ACCOUNT_NAME')} ${`${(account?.id ?? 0) + 1}`}`;
  };

  return (
    <AccountInfoContainer onClick={handlePressAccount}>
      <CurrentAccountContainer>
        <AccountTag>
          <GradientCircle
            firstGradient={gradient[0]}
            secondGradient={gradient[1]}
            thirdGradient={gradient[2]}
          />
          {account && <CurrentSelectedAccountText>{getName()}</CurrentSelectedAccountText>}
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
