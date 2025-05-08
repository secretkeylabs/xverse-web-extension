import useSelectedAccount from '@hooks/useSelectedAccount';
import { format, truncateAddress, type Account } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StickyHorizontalSplitButtonContainer, StyledP } from '@ui-library/common.styled';
import SendLayout from 'app/layouts/sendLayout';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { type Args } from './utils';

// Feels wrong having a "title" represented by a "<p>" tab."
const Title = styled.p(({ theme }) => ({
  ...theme.typography.body_medium_m,
  color: theme.colors.white_200,
}));

const Container = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  rowGap: theme.space.l,
}));

type Props = {
  onConfirm: (args: Args) => void;
  onCancel: () => void;
  onBack: () => void;
  recipientAddress: string;

  /** Amount in fri. */
  amount: bigint;
};

type LayoutProps = Props & {
  selectedAccount: Extract<Account, { accountType: 'software' }>;
};

function Layout(props: LayoutProps) {
  const { recipientAddress, amount, onCancel, onConfirm, onBack, selectedAccount } = props;
  const { t } = useTranslation('translation');

  return (
    <SendLayout selectedBottomTab="dashboard" onClickBack={onBack}>
      <Container>
        <StyledP typography="headline_s">{t('CONFIRM_TRANSACTION.REVIEW_TRANSACTION')}</StyledP>

        <Title>{t('CONFIRM_TRANSACTION.YOU_WILL_SEND')}</Title>

        <p>{truncateAddress(recipientAddress)}</p>

        <p>
          {format({
            currency: 'crypto/starknet/starknet',
            amount,
          })}
        </p>
      </Container>

      <StickyHorizontalSplitButtonContainer>
        <Button title={t('COMMON.CANCEL')} onClick={onCancel} variant="secondary" />
        <Button
          title={t('COMMON.CONFIRM')}
          onClick={() =>
            onConfirm({
              recipient: recipientAddress,
              amount,
              currentAccount: selectedAccount,
            })
          }
        />
      </StickyHorizontalSplitButtonContainer>
    </SendLayout>
  );
}

function LoadAccount(props: Props) {
  const selectedAccount = useSelectedAccount();

  if (selectedAccount.accountType !== 'software') {
    throw new Error('Account type not supported, must be a software account');
  }

  return <Layout {...props} selectedAccount={selectedAccount} />;
}

export function ReviewTransaction(props: Props) {
  return <LoadAccount {...props} />;
}
