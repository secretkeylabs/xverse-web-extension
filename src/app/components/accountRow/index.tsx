import styled from 'styled-components';
import { Account } from '@stores/wallet/actions/types';
import { getAccountGradient } from '@utils/gradient';
import { useTranslation } from 'react-i18next';
import { getAddressDetail } from '@utils/helper';

interface GradientCircleProps {
  firstGradient: string;
  secondGradient: string;
  thirdGradient: string;
}

const GradientCircle = styled.div<GradientCircleProps>((props) => ({
  height: 47,
  width: 47,
  borderRadius: 25,
  background: `linear-gradient(to bottom,${props.firstGradient}, ${props.secondGradient},${props.thirdGradient} )`,
}));

const TopSectionContainer = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  paddingTop: props.theme.spacing(8),
  backgroundColor: 'transparent',
}));

const CurrentAcountContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingTop: props.theme.spacing(2),
}));

const CurrentSelectedAccountText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['0'],
  textAlign: 'start',
}));

const CurrentUnSelectedAccountText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['400'],
  textAlign: 'start',
}));

const CurrentAccountDetailText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
  marginTop: props.theme.spacing(1),
}));

interface Props {
  account: Account | null;
  isSelected: boolean;
  onAccountSelected: (account: Account) => void;
}

function AccountRow({ account, isSelected, onAccountSelected }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const gradient = getAccountGradient(account?.stxAddress!);

  function getName() {
    return account?.bnsName ?? `${t('ACCOUNT_NAME')} ${`${(account?.id ?? 0) + 1}`}`;
  }

  const onClick = () => {
    onAccountSelected(account!);
  };

  return (
    <TopSectionContainer onClick={onClick}>
      <GradientCircle
        firstGradient={gradient[0]}
        secondGradient={gradient[1]}
        thirdGradient={gradient[2]}
      />
      <CurrentAcountContainer>
        {isSelected ? (
          <CurrentSelectedAccountText>{getName()}</CurrentSelectedAccountText>
        ) : (
          <CurrentUnSelectedAccountText>{getName()}</CurrentUnSelectedAccountText>
        )}
        <CurrentAccountDetailText>{getAddressDetail(account!)}</CurrentAccountDetailText>
      </CurrentAcountContainer>
    </TopSectionContainer>
  );
}

export default AccountRow;
