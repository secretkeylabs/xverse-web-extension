import LedgerBadge from '@assets/img/ledger/ledger_badge.svg';
import BarLoader from '@components/barLoader';
import OptionsDialog from '@components/optionsDialog/optionsDialog';
import useOptionsDialog from '@hooks/useOptionsDialog';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { CaretDown, DotsThreeVertical } from '@phosphor-icons/react';
import { currencySymbolMap, type Account } from '@secretkeylabs/xverse-core';
import { removeAccountAvatarAction } from '@stores/wallet/actions/actionCreators';
import Button from '@ui-library/button';
import Input from '@ui-library/input';
import Sheet from '@ui-library/sheet';
import SnackBar from '@ui-library/snackBar';
import Spinner from '@ui-library/spinner';
import { EMPTY_LABEL, LoaderSize } from '@utils/constants';
import { isKeystoneAccount, isLedgerAccount, validateAccountName } from '@utils/helper';
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

function AccountRow({
  account,
  isSelected,
  onAccountSelected,
  isAccountListView = false,
  disabledAccountSelect = false,
}: {
  account: Account | null;
  isSelected: boolean;
  onAccountSelected: (account: Account, goBack?: boolean) => void;
  isAccountListView?: boolean;
  disabledAccountSelect?: boolean;
}) {
  const dispatch = useDispatch();
  const menuDialog = useOptionsDialog();
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const { t: optionsDialogTranslation } = useTranslation('translation', {
    keyPrefix: 'OPTIONS_DIALOG',
  });
  const { accountsList, ledgerAccountsList, fiatCurrency, accountBalances, avatarIds } =
    useWalletSelector();
  const accountAvatar = avatarIds[account?.btcAddress ?? ''];
  const totalBalance = accountBalances[account?.btcAddress ?? ''];
  const btcCopiedTooltipTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const stxCopiedTooltipTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const [showRemoveAccountModal, setShowRemoveAccountModal] = useState(false);
  const [showRenameAccountModal, setShowRenameAccountModal] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountNameError, setAccountNameError] = useState<string | null>(null);
  const [isAccountNameChangeLoading, setIsAccountNameChangeLoading] = useState(false);
  const { removeLedgerAccount, removeKeystoneAccount, renameAccount, updateLedgerAccounts } =
    useWalletReducer();

  useEffect(
    () => () => {
      clearTimeout(btcCopiedTooltipTimeoutRef.current);
      clearTimeout(stxCopiedTooltipTimeoutRef.current);
    },
    [],
  );

  useEffect(() => {
    const validationError = validateAccountName(
      accountName,
      optionsDialogTranslation,
      accountsList,
      ledgerAccountsList,
    );
    if (validationError) {
      setAccountNameError(validationError);
    } else {
      setAccountNameError(null);
    }
  }, [accountName, accountsList, ledgerAccountsList, optionsDialogTranslation]);

  const handleClick = () => {
    onAccountSelected(account!);
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
    dispatch(removeAccountAvatarAction({ address: account?.btcAddress ?? '' }));
    toast.custom(
      <SnackBar text={optionsDialogTranslation('NFT_AVATAR.REMOVE_TOAST')} type="neutral" />,
    );
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
      onAccountSelected(accountsList[0], false);
      handleRemoveAccountModalClose();
    } catch (err) {
      // console.error(err);
    }
  };

  const handleRenameAccount = async () => {
    if (!account) {
      return;
    }

    const validationError = validateAccountName(
      accountName,
      optionsDialogTranslation,
      accountsList,
      ledgerAccountsList,
    );
    if (validationError) {
      setAccountNameError(validationError);
      return;
    }

    try {
      setIsAccountNameChangeLoading(true);
      if (isLedgerAccount(account)) {
        await updateLedgerAccounts({ ...account, accountName });
      } else {
        await renameAccount({ ...account, accountName });
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
      if (isLedgerAccount(account)) {
        updateLedgerAccounts({ ...account, accountName: undefined });
      } else {
        renameAccount({ ...account, accountName: undefined });
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
    <Container>
      <AccountInfoContainer $disableClick={disabledAccountSelect} onClick={handleClick}>
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
                  {account?.accountName ??
                    account?.bnsName ??
                    `${t('ACCOUNT_NAME')} ${`${(account?.id ?? 0) + 1}`}`}
                </AccountName>
                {isLedgerAccount(account) && <img src={LedgerBadge} alt="Ledger icon" />}
                {isSelected && !disabledAccountSelect && !isAccountListView && (
                  <CaretDown color={Theme.colors.white_0} weight="bold" size={16} />
                )}
              </CurrentAccountTextContainer>
              {isAccountListView && totalBalance && (
                <NumericFormat
                  value={totalBalance}
                  displayType="text"
                  prefix={`${currencySymbolMap[fiatCurrency]}`}
                  thousandSeparator
                  renderText={(value: string) => (
                    <Balance data-testid="account-balance" $isSelected={isSelected}>
                      {value}
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
          {isKeystoneAccount(account) && (
            <ButtonRow onClick={handleRemoveAccountModalOpen}>
              {optionsDialogTranslation('REMOVE_FROM_LIST')}
            </ButtonRow>
          )}
        </OptionsDialog>
      )}

      {showRemoveAccountModal && (
        <Sheet
          visible={showRemoveAccountModal}
          title={t('REMOVE_FROM_LIST_TITLE')}
          onClose={handleRemoveAccountModalClose}
        >
          <ModalContent>
            <ModalDescription>{t('REMOVE_FROM_LIST_DESCRIPTION')}</ModalDescription>
            <ModalControlsContainer $bigSpacing>
              <ModalButtonContainer>
                <Button
                  variant="secondary"
                  title={t('CANCEL')}
                  onClick={handleRemoveAccountModalClose}
                />
              </ModalButtonContainer>
              <ModalButtonContainer>
                <Button variant="danger" title={t('REMOVE_WALLET')} onClick={handleRemoveAccount} />
              </ModalButtonContainer>
            </ModalControlsContainer>
          </ModalContent>
        </Sheet>
      )}

      {showRenameAccountModal && (
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
                  disabled={!accountName || !!accountNameError}
                  loading={isAccountNameChangeLoading}
                />
              </ModalButtonContainer>
            </ModalControlsContainer>
          </ModalContent>
        </Sheet>
      )}
    </Container>
  );
}

export default AccountRow;
