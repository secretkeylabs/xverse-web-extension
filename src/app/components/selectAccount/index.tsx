import LedgerBadge from '@assets/img/ledger/ledger_badge.svg';
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
  height: 52,
  borderRadius: 12,
  border: `1px solid ${props.theme.colors.white_800}`,
  backgroundColor: props.theme.colors.elevation6_800,
  padding: 16,
}));

const CurrentAccountContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
}));

const CurrentAccountTextContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: props.theme.spacing(4),
  paddingLeft: props.theme.spacing(4),
}));

const CurrentSelectedAccountText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
  textAlign: 'start',
}));

interface GradientCircleProps {
  firstGradient: string;
  secondGradient: string;
  thirdGradient: string;
}
const GradientCircle = styled.div<GradientCircleProps>((props) => ({
  width: 20,
  height: 20,
  borderRadius: 25,
  background: `linear-gradient(to bottom,${props.firstGradient}, ${props.secondGradient},${props.thirdGradient} )`,
}));

const SwitchAccountContainer = styled.div(() => ({
  display: 'flex',
  alignItems: 'center',
}));
const SwitchAccountText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
  paddingRight: props.theme.spacing(2),
  textAlign: 'start',
}));

type SelectAccountProps = {
  account: Account;
  handlePressAccount: () => void;
};

function SelectAccount({ account, handlePressAccount }: SelectAccountProps) {
  const gradient = getAccountGradient(account?.stxAddress || account?.btcAddress!);
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const theme = useTheme();
  const getName = () =>
    account?.accountName ??
    account?.bnsName ??
    `${t('ACCOUNT_NAME')} ${`${(account?.id ?? 0) + 1}`}`;

  return (
    <AccountInfoContainer onClick={handlePressAccount}>
      <CurrentAccountContainer>
        <GradientCircle
          firstGradient={gradient[0]}
          secondGradient={gradient[1]}
          thirdGradient={gradient[2]}
        />
        {account && (
          <CurrentAccountTextContainer>
            <CurrentSelectedAccountText>{getName()}</CurrentSelectedAccountText>
            {isHardwareAccount(account) && <img src={LedgerBadge} alt="Ledger icon" />}
          </CurrentAccountTextContainer>
        )}
      </CurrentAccountContainer>
      <SwitchAccountContainer>
        <SwitchAccountText>Change account</SwitchAccountText>
        <CaretRight color={theme.colors.white_0} />
      </SwitchAccountContainer>
    </AccountInfoContainer>
  );
}

export default SelectAccount;
