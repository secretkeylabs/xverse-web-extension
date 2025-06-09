import KeystoneBadge from '@assets/img/hw/keystone/keystone_badge.svg';
import LedgerBadge from '@assets/img/hw/ledger/ledger_badge.svg';
import BarLoader from '@components/barLoader';
import OptionsDialog from '@components/optionsDialog/optionsDialog';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useGetAllAccounts from '@hooks/useGetAllAccounts';
import useOptionsDialog from '@hooks/useOptionsDialog';
import { useStore } from '@hooks/useStore';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { CaretDown, DotsThreeVertical } from '@phosphor-icons/react';
import {
  currencySymbolMap,
  getFiatBtcEquivalent,
  type Account,
  type WalletId,
} from '@secretkeylabs/xverse-core';
import { removeAccountAvatarAction } from '@stores/wallet/actions/actionCreators';
import Button from '@ui-library/button';
import Dialog from '@ui-library/dialog';
import Input from '@ui-library/input';
import Sheet from '@ui-library/sheet';
import Spinner from '@ui-library/spinner';
import { BTC_SYMBOL, EMPTY_LABEL, HIDDEN_BALANCE_LABEL, LoaderSize } from '@utils/constants';
import {
  getAccountName,
  isKeystoneAccount,
  isLedgerAccount,
  validateAccountName,
} from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useDispatch } from 'react-redux';
import 'react-tooltip/dist/react-tooltip.css';
import Theme from 'theme';
import AccountAvatar from './accountAvatar';
import {
  AccountInfoContainer,
  AccountName,
  Balance,
  BarLoaderContainer,
  ButtonRow,
  Container,
  CurrentAccountContainer,
  CurrentAccountTextContainer,
  InputLabel,
  ModalButtonContainer,
  ModalContent,
  ModalControlsContainer,
  ModalDescription,
  OptionsButton,
  StyledButton,
  TransparentSpan,
} from './index.styled';

type Props = {
  walletId?: WalletId;
  account: Account;
  isSelected: boolean;
  onAccountSelected: (account: Account, goBack?: boolean) => void;
  isAccountListView?: boolean;
  disabledAccountSelect?: boolean;
};

function AccountRow({
  walletId,
  account,
  isSelected,
  onAccountSelected,
  isAccountListView = false,
  disabledAccountSelect = false,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const { t: optionsDialogTranslation } = useTranslation('translation', {
    keyPrefix: 'OPTIONS_DIALOG',
  });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'COMMON' });

  const dispatch = useDispatch();
  const menuDialog = useOptionsDialog();
  const { softwareWallets, fiatCurrency, avatarIds, balanceHidden, showBalanceInBtc, network } =
    useWalletSelector();
  const accountAvatar = avatarIds[account?.btcAddresses.taproot.address ?? ''];
  const btcCopiedTooltipTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const stxCopiedTooltipTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const [showRemoveAccountModal, setShowRemoveAccountModal] = useState(false);
  const [showRenameAccountModal, setShowRenameAccountModal] = useState(false);
  const initialAccountName = account?.accountName ?? '';
  const [accountName, setAccountName] = useState(initialAccountName);
  const [accountNameError, setAccountNameError] = useState<string | null>(null);
  const [isAccountNameChangeLoading, setIsAccountNameChangeLoading] = useState(false);
  const {
    removeLedgerAccount,
    removeKeystoneAccount,
    updateSoftwareWalletAccounts,
    updateLedgerAccounts,
    updateKeystoneAccounts,
  } = useWalletReducer();
  const { btcFiatRate } = useSupportedCoinRates();

  const accountBalanceStore = useStore(
    'accountBalances',
    (store, utils) =>
      store[utils.getAccountStorageKey(account, network.type)] as string | undefined,
  );
  const totalBalance = accountBalanceStore.data;

  useEffect(
    () => () => {
      clearTimeout(btcCopiedTooltipTimeoutRef.current);
      clearTimeout(stxCopiedTooltipTimeoutRef.current);
    },
    [],
  );

  const allAccounts = useGetAllAccounts();

  useEffect(() => {
    if (accountName === initialAccountName) {
      return;
    }

    const validationError = validateAccountName(accountName, optionsDialogTranslation, allAccounts);
    if (validationError) {
      setAccountNameError(validationError);
    } else {
      setAccountNameError(null);
    }
  }, [accountName, allAccounts, optionsDialogTranslation, initialAccountName]);

  const handleClick = () => {
    onAccountSelected(account);
  };

  const handleRemoveAccountModalOpen = () => {
    setShowRemoveAccountModal(true);
  };

  const handleRemoveAccountModalClose = () => {
    setShowRemoveAccountModal(false);
  };

  const handleRenameAccountModalOpen = () => {
    setShowRenameAccountModal(true);
  };

  const handleRenameAccountModalClose = () => {
    setShowRenameAccountModal(false);
  };

  const handleRemoveAvatar = () => {
    if (!account) return;
    dispatch(removeAccountAvatarAction({ address: account?.btcAddresses.taproot.address }));
    toast(optionsDialogTranslation('NFT_AVATAR.REMOVE_TOAST'));
  };

  const handleRemoveAccount = async () => {
    if (!account) {
      return;
    }

    try {
      if (account.accountType === 'ledger') {
        await removeLedgerAccount(account);
      } else if (account.accountType === 'keystone') {
        await removeKeystoneAccount(account);
      }
      const wallet = softwareWallets[network.type].find((w) => w.accounts.length > 0);
      if (!wallet) {
        throw new Error('No software wallet found');
      }
      onAccountSelected(wallet.accounts[0], false);
      handleRemoveAccountModalClose();
    } catch (err) {
      // console.error(err);
    }
  };

  const handleRenameAccount = async () => {
    if (!account) {
      return;
    }

    const validationError = validateAccountName(accountName, optionsDialogTranslation, allAccounts);
    if (validationError) {
      setAccountNameError(validationError);
      return;
    }

    try {
      setIsAccountNameChangeLoading(true);
      if (isLedgerAccount(account)) {
        await updateLedgerAccounts({ ...account, accountName });
      } else if (isKeystoneAccount(account)) {
        await updateKeystoneAccounts({ ...account, accountName });
      } else {
        if (!walletId) {
          throw new Error('No selected wallet id. Cannot rename account.');
        }
        await updateSoftwareWalletAccounts(walletId, { ...account, accountName });
      }
      handleRenameAccountModalClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAccountNameChangeLoading(false);
    }
  };

  const handleResetAccountName = () => {
    if (!account) {
      return;
    }

    try {
      setIsAccountNameChangeLoading(true);
      const { accountName: removedAccountName, ...namelessAccount } = account;
      if (isLedgerAccount(account)) {
        updateLedgerAccounts(namelessAccount);
      } else if (isKeystoneAccount(account)) {
        updateKeystoneAccounts(namelessAccount);
      } else {
        if (!walletId) {
          throw new Error('No wallet id. Cannot remove account name.');
        }
        updateSoftwareWalletAccounts(walletId, namelessAccount);
      }
      setAccountName('');
      handleRenameAccountModalClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAccountNameChangeLoading(false);
    }
  };

  return (
    <>
      <Container>
        <AccountInfoContainer
          $cursor={disabledAccountSelect ? 'initial' : 'pointer'}
          onClick={handleClick}
        >
          <AccountAvatar
            account={account}
            avatar={accountAvatar}
            isSelected={isSelected}
            isAccountListView={isAccountListView}
          />
          <CurrentAccountContainer>
            {account && (
              <TransparentSpan>
                <CurrentAccountTextContainer>
                  <AccountName aria-label="Account Name" $isSelected={isSelected}>
                    {getAccountName(account, tCommon)}
                  </AccountName>
                  {isLedgerAccount(account) && <img src={LedgerBadge} alt="Ledger icon" />}
                  {isKeystoneAccount(account) && <img src={KeystoneBadge} alt="Keystone icon" />}
                  {isSelected && !disabledAccountSelect && !isAccountListView && (
                    <CaretDown color={Theme.colors.white_0} weight="bold" size={16} />
                  )}
                </CurrentAccountTextContainer>
                {showBalanceInBtc && isAccountListView && totalBalance && (
                  <NumericFormat
                    value={getFiatBtcEquivalent(
                      BigNumber(totalBalance),
                      BigNumber(btcFiatRate),
                    ).toString()}
                    displayType="text"
                    prefix={BTC_SYMBOL}
                    thousandSeparator
                    renderText={(value: string) => (
                      <Balance data-testid="account-balance" $isSelected={isSelected}>
                        {value}
                      </Balance>
                    )}
                  />
                )}
                {!showBalanceInBtc && isAccountListView && totalBalance && (
                  <NumericFormat
                    value={totalBalance}
                    displayType="text"
                    prefix={`${currencySymbolMap[fiatCurrency]}`}
                    thousandSeparator
                    renderText={(value: string) => (
                      <Balance data-testid="account-balance" $isSelected={isSelected}>
                        {!showBalanceInBtc && balanceHidden && HIDDEN_BALANCE_LABEL}
                        {!showBalanceInBtc && !balanceHidden && value}
                      </Balance>
                    )}
                  />
                )}
                {isAccountListView && !totalBalance && (
                  <Balance $isSelected={isSelected}>
                    {EMPTY_LABEL}
                    <Spinner color="white" size={12} />
                  </Balance>
                )}
              </TransparentSpan>
            )}

            {!account && (
              <BarLoaderContainer>
                <BarLoader loaderSize={LoaderSize.LARGE} />
                <BarLoader loaderSize={LoaderSize.MEDIUM} />
              </BarLoaderContainer>
            )}
          </CurrentAccountContainer>
        </AccountInfoContainer>

        {isAccountListView && (
          <OptionsButton aria-label="Open Account Options" onClick={menuDialog.open}>
            <DotsThreeVertical size={20} fill="white" />
          </OptionsButton>
        )}

        {menuDialog.isVisible && (
          <OptionsDialog closeDialog={menuDialog.close} optionsDialogIndents={menuDialog.indents}>
            <ButtonRow onClick={handleRenameAccountModalOpen}>
              {optionsDialogTranslation('RENAME_ACCOUNT')}
            </ButtonRow>
            {accountAvatar?.type && (
              <ButtonRow onClick={handleRemoveAvatar}>
                {optionsDialogTranslation('NFT_AVATAR.REMOVE_ACTION')}
              </ButtonRow>
            )}
            {(isLedgerAccount(account) || isKeystoneAccount(account)) && (
              <ButtonRow onClick={handleRemoveAccountModalOpen}>
                {optionsDialogTranslation('REMOVE_FROM_LIST')}
              </ButtonRow>
            )}
          </OptionsDialog>
        )}

        <Sheet
          visible={showRenameAccountModal}
          title={optionsDialogTranslation('RENAME_ACCOUNT')}
          onClose={handleRenameAccountModalClose}
        >
          <ModalContent>
            <ModalDescription>
              {optionsDialogTranslation('RENAME_ACCOUNT_MODAL.NAME_RULES')}
            </ModalDescription>
            <InputLabel>
              {optionsDialogTranslation('RENAME_ACCOUNT_MODAL.LABEL')}
              <StyledButton
                variant="tertiary"
                onClick={handleResetAccountName}
                title={optionsDialogTranslation('RENAME_ACCOUNT_MODAL.RESET_NAME')}
                type="reset"
              />
            </InputLabel>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              feedback={[
                {
                  message: accountNameError || '',
                  variant: accountNameError ? 'danger' : undefined,
                },
              ]}
              autoFocus
            />
            <ModalControlsContainer>
              <ModalButtonContainer>
                <Button
                  title={t('CONFIRM')}
                  onClick={handleRenameAccount}
                  disabled={
                    !accountName || !!accountNameError || accountName === initialAccountName
                  }
                  loading={isAccountNameChangeLoading}
                />
              </ModalButtonContainer>
            </ModalControlsContainer>
          </ModalContent>
        </Sheet>
      </Container>

      <Dialog
        visible={showRemoveAccountModal}
        title={t('REMOVE_FROM_LIST_TITLE')}
        description={t('REMOVE_FROM_LIST_DESCRIPTION')}
        leftButtonText={t('CANCEL')}
        rightButtonText={t('REMOVE_WALLET')}
        onLeftButtonClick={handleRemoveAccountModalClose}
        onRightButtonClick={handleRemoveAccount}
        onClose={handleRemoveAccountModalClose}
        type="default"
      />
    </>
  );
}

export default AccountRow;
