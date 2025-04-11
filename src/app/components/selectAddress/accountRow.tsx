import KeystoneBadge from '@assets/img/hw/keystone/keystone_badge.svg';
import LedgerBadge from '@assets/img/hw/ledger/ledger_badge.svg';
import type { AddressType } from '@common/types/address';
import AccountAvatar from '@components/accountRow/accountAvatar';
import {
  AccountInfoContainer,
  AccountName,
  Container,
  CurrentAccountContainer,
  CurrentAccountTextContainer,
} from '@components/accountRow/index.styled';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import type { Account } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { getTruncatedAddress, isKeystoneAccount, isLedgerAccount } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const CustomAccountContainer = styled(CurrentAccountContainer)((props) => ({
  textAlign: 'left',
  gap: props.theme.space.xxxs,
}));

type Props = {
  account: Account | null;
  address: string;
  onSelect?: (address: string) => void;
};

function AccountRow({ account, onSelect, address }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const { avatarIds } = useWalletSelector();
  const selectedAccount = useSelectedAccount();
  const accountAvatar = avatarIds[account?.btcAddresses.taproot.address ?? ''];

  const isDisabled = address === selectedAccount.stxAddress;

  const handleClick = () => {
    onSelect?.(address);
  };

  return (
    <Container $disableClick={isDisabled}>
      <AccountInfoContainer
        onClick={isDisabled ? undefined : handleClick}
        $cursor={isDisabled ? 'not-allowed' : onSelect ? 'pointer' : 'initial'}
      >
        <AccountAvatar account={account} avatar={accountAvatar} isSelected isAccountListView />
        {account && (
          <CustomAccountContainer>
            <CurrentAccountTextContainer>
              <AccountName aria-label="Account Name" $isSelected>
                {account?.accountName ??
                  account?.bnsName ??
                  `${t('ACCOUNT_NAME')} ${`${(account?.id ?? 0) + 1}`}`}
              </AccountName>
              {isLedgerAccount(account) && <img src={LedgerBadge} alt="Ledger icon" />}
              {isKeystoneAccount(account) && <img src={KeystoneBadge} alt="Keystone icon" />}
            </CurrentAccountTextContainer>
            <StyledP typography="body_medium_m" color="white_200">
              {getTruncatedAddress(address, 6)}
            </StyledP>
          </CustomAccountContainer>
        )}
      </AccountInfoContainer>
    </Container>
  );
}

export default AccountRow;
