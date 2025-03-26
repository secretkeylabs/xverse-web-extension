import { CaretDown, CaretUp } from '@phosphor-icons/react';
import type { DerivationType } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Divider from '@ui-library/divider';
import { getShortTruncatedAddress } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { AccountDetails } from '../../types';
import Balances from './balances';

const CardButton = styled.button`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.space.m};
  border-radius: ${({ theme }) => theme.radius(2)}px;
  border: 1px solid ${({ theme }) => theme.colors.white_850};
  color: ${({ theme }) => theme.colors.white_0};
  background-color: transparent;
  transition: background-color 0.1s ease;
  margin-top: ${({ theme }) => theme.space.s};

  &:hover {
    background-color: ${({ theme }) => theme.colors.elevation6_800};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.elevation6_600};
  }
`;

const TitleWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BalancesWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs};
`;

const DetailsContainer = styled.div`
  margin-top: ${({ theme }) => theme.space.m};
`;

const HR = styled(Divider)<{ $withTopMargin?: boolean }>`
  margin-top: ${({ theme, $withTopMargin }) => ($withTopMargin ? theme.space.m : 0)};
`;

const DetailContainer = styled.div`
  margin-top: ${({ theme }) => theme.space.m};
  display: flex;
  justify-content: space-between;
`;

function DetailValue({
  title,
  value,
  secondaryValue,
}: {
  title: string;
  value?: string;
  secondaryValue?: boolean;
}) {
  return (
    <DetailContainer>
      <StyledP typography="body_medium_s" color="white_400">
        {title}
      </StyledP>
      <StyledP typography="body_medium_s" color={secondaryValue ? 'white_400' : 'white_0'}>
        {value}
      </StyledP>
    </DetailContainer>
  );
}

type Props = {
  idx: number;
  accountDetails: AccountDetails;
  derivationType: DerivationType;
};

function AccountDrawer({ idx, accountDetails, derivationType }: Props) {
  const { t } = useTranslation('translation', {
    keyPrefix: 'RESTORE_WALLET_SCREEN.SELECT_DERIVATION_TYPE.ACCOUNT_DETAIL',
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  const account = derivationType === 'account' ? idx : 0;
  const index = derivationType === 'index' ? idx : 0;

  const btcBalanceSats =
    accountDetails.native.balance + accountDetails.nested.balance + accountDetails.taproot.balance;
  const stxBalanceMicroStx = accountDetails.stx.balance;

  return (
    <CardButton onClick={() => setDrawerOpen((curVal) => !curVal)}>
      <TitleWrapper>
        <StyledP typography="body_medium_m">{`${t('ACCOUNT_PREFIX')} ${idx + 1}`}</StyledP>
        <BalancesWrapper>
          <Balances btc={btcBalanceSats} stx={stxBalanceMicroStx} exact />
          {drawerOpen ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
        </BalancesWrapper>
      </TitleWrapper>
      {drawerOpen && (
        <DetailsContainer>
          <HR />
          <DetailValue
            title={t('DERIVATION_TEMPLATE_TITLE')}
            value={t('DERIVATION_TEMPLATE_VALUE', { account, index })}
            secondaryValue
          />
          <HR $withTopMargin />
          <DetailValue
            title={t('NATIVE_TITLE')}
            value={getShortTruncatedAddress(accountDetails.native.address)}
          />
          <DetailValue
            title={t('NESTED_TITLE')}
            value={getShortTruncatedAddress(accountDetails.nested.address)}
          />
          <DetailValue
            title={t('TAPROOT_TITLE')}
            value={getShortTruncatedAddress(accountDetails.taproot.address)}
          />
          <DetailValue
            title={t('STACKS_TITLE')}
            value={getShortTruncatedAddress(accountDetails.stx.address)}
          />
        </DetailsContainer>
      )}
    </CardButton>
  );
}

export default AccountDrawer;
