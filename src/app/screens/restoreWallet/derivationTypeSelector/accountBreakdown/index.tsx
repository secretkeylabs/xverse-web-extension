import type { DerivationType } from '@secretkeylabs/xverse-core';
import BackButton from '@ui-library/backButton';
import { StyledP } from '@ui-library/common.styled';
import { InputFeedback } from '@ui-library/inputFeedback';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { Summary } from '../../types';
import AccountDrawer from './accountDrawer';
import Balances from './balances';

const Container = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  marginTop: props.theme.space.l,
  marginBottom: props.theme.space.m,
}));

const SubTitleContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const SubTitle = styled.h1((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  gap: props.theme.space.xxs,
}));

const AccountContainer = styled.div({
  flexGrow: 1,
});

const InfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.s,
  marginTop: props.theme.space.m,
  marginBottom: props.theme.space.l,
}));

type Props = {
  derivationType: DerivationType;
  summary: Summary;
  onBack: () => void;
};

function AccountBreakdown({ derivationType, summary, onBack }: Props) {
  const { t } = useTranslation('translation', {
    keyPrefix: 'RESTORE_WALLET_SCREEN.SELECT_DERIVATION_TYPE.ACCOUNT_DETAIL',
  });

  const title = derivationType === 'account' ? t('TITLE_ACCOUNT') : t('TITLE_INDEX');

  const { btcTotal, stxTotal } = useMemo(() => {
    const btcTotalSats = summary.accountDetails.reduce(
      (acc, accountDetail) =>
        acc +
        accountDetail.native.balance +
        accountDetail.nested.balance +
        accountDetail.taproot.balance,
      0n,
    );

    const stxTotalMicro = summary.accountDetails.reduce(
      (acc, accountDetail) => acc + accountDetail.stx.balance,
      0n,
    );

    return { btcTotal: btcTotalSats, stxTotal: stxTotalMicro };
  }, [summary]);

  return (
    <Container>
      <BackButton onClick={onBack} />
      <Title>{title}</Title>
      <SubTitleContainer>
        <SubTitle>
          <StyledP typography="body_bold_m" color="white_0">
            {`${summary.accountCount}${summary.hasMoreAccounts ? '+' : ''}`}
          </StyledP>
          <StyledP typography="body_m" color="white_200">
            {t('ACCOUNTS_FOUND')}
          </StyledP>
        </SubTitle>
        <Balances
          btc={btcTotal}
          stx={stxTotal}
          exact={!summary.hasMoreAccounts}
          typography="body_medium_s"
          color="white_400"
        />
      </SubTitleContainer>
      <AccountContainer>
        {summary.accountDetails.map((accountDetail, idx) => (
          <AccountDrawer
            key={accountDetail.native.address}
            idx={idx}
            accountDetails={accountDetail}
            derivationType={derivationType}
          />
        ))}
      </AccountContainer>
      <InfoContainer>
        {summary.hasMoreAccounts && (
          <InputFeedback variant="info" message={t('INFO_ACCOUNT_LIMIT')} />
        )}
        <InputFeedback variant="info" message={t('INFO_FUNDS_LIMIT')} />
      </InfoContainer>
    </Container>
  );
}

export default AccountBreakdown;
