import { Account } from '@secretkeylabs/xverse-core';
import { getAccountGradient } from '@utils/gradient';
import { getTruncatedAddress } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface GradientCircleProps {
  firstGradient: string;
  secondGradient: string;
  thirdGradient: string;
}
const GradientCircle = styled.div<GradientCircleProps>((props) => ({
  height: 40,
  width: 40,
  borderRadius: 25,
  marginRight: 9,
  background: `linear-gradient(to bottom,${props.firstGradient}, ${props.secondGradient},${props.thirdGradient} )`,
}));

const Container = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const CurrentSelectedAccountText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['0'],
  textAlign: 'start',
}));

const AddressText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginTop: props.theme.spacing(1),
  color: props.theme.colors.white['400'],
}));

interface Props {
  account: Account;
  isBitcoinTx: boolean;
}
function AccountView({ account, isBitcoinTx }: Props) {
  const gradient = getAccountGradient(account?.stxAddress!);
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });

  function getName() {
    return account?.bnsName ?? `${t('ACCOUNT_NAME')} ${`${(account?.id ?? 0) + 1}`}`;
  }
  return (
    <Container>
      <GradientCircle
        firstGradient={gradient[0]}
        secondGradient={gradient[1]}
        thirdGradient={gradient[2]}
      />

      <ColumnContainer>
        <CurrentSelectedAccountText>{getName()}</CurrentSelectedAccountText>
        <AddressText>{getTruncatedAddress(isBitcoinTx ? account?.btcAddress : account?.ordinalsAddress)}</AddressText>
      </ColumnContainer>
    </Container>
  );
}

export default AccountView;
