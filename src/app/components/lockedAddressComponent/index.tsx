import AddressIcon from '@assets/img/transactions/address.svg';
import LockIcon from '@assets/img/transactions/Lock.svg';
import ScriptIcon from '@assets/img/transactions/ScriptIcon.svg';
import TransferDetailView from '@components/transferDetailView';
import type { Account } from '@secretkeylabs/xverse-core';
import { MAX_ACC_NAME_LENGTH } from '@utils/constants';
import { formatDate } from '@utils/date';
import { getAccountGradient } from '@utils/gradient';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const GradientCircle = styled.div<{
  firstGradient: string;
  secondGradient: string;
  thirdGradient: string;
}>((props) => ({
  width: 32,
  height: 32,
  borderRadius: 25,
  background: `linear-gradient(to bottom,${props.firstGradient}, ${props.secondGradient},${props.thirdGradient} )`,
}));

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: '16px 16px',
  justifyContent: 'center',
  marginBottom: 12,
}));

const RecipientTitleText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.xs,
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'flex-start',
  marginBottom: 12,
});
const AccountContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
  gap: 8,
});

const Icon = styled.img((props) => ({
  marginRight: props.theme.spacing(4),
  width: 32,
  height: 32,
  borderRadius: 30,
}));

const TitleText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_200,
  textAlign: 'center',
}));

const ValueText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
}));

const LockTimeContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-end',
});

function LockTimeRow({ icon, title, lockTime }: { icon: string; title: string; lockTime: number }) {
  const date = formatDate(new Date(lockTime * 1000));
  return (
    <LockTimeContainer>
      {icon && <Icon src={icon} />}
      <TitleText>{title}</TitleText>
      <LockTimeContainer>
        <ValueText>{date}</ValueText>
      </LockTimeContainer>
    </LockTimeContainer>
  );
}

interface Props {
  address?: string;
  script: string;
  locktime: number;
  heading?: string;
  account?: Account;
}
function LockedAddressComponent({ address, script, locktime, heading, account }: Props) {
  const { t } = useTranslation('translation');

  const gradient = getAccountGradient(account?.stxAddress || account?.btcAddress!);
  const getName = () => {
    const name =
      account?.accountName ??
      account?.bnsName ??
      `${t('ACCOUNT_NAME')} ${`${(account?.id ?? 0) + 1}`}`;

    return name.length > MAX_ACC_NAME_LENGTH ? `${name.slice(0, MAX_ACC_NAME_LENGTH)}...` : name;
  };

  return (
    <Container>
      {heading && <RecipientTitleText>{heading}</RecipientTitleText>}
      {address && (
        <RowContainer>
          <TransferDetailView icon={AddressIcon} title={t('LOCKED.ADDRESS')} address={address} />
        </RowContainer>
      )}
      {script && (
        <RowContainer>
          <TransferDetailView
            icon={ScriptIcon}
            title={t('LOCKED.REDEEM_SCRIPT')}
            address={script}
          />
        </RowContainer>
      )}
      {locktime && (
        <RowContainer>
          <LockTimeRow icon={LockIcon} title={t('LOCKED.LOCK_TIME')} lockTime={locktime} />
        </RowContainer>
      )}

      {account && (
        <div>
          <AccountContainer>
            <GradientCircle
              firstGradient={gradient[0]}
              secondGradient={gradient[1]}
              thirdGradient={gradient[2]}
            />
            <TitleText>{getName()}</TitleText>
          </AccountContainer>
        </div>
      )}
    </Container>
  );
}

export default LockedAddressComponent;
