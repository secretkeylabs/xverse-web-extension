import LedgerBadge from '@assets/img/ledger/ledger_badge.svg';
import BarLoader from '@components/barLoader';
import OptionsDialog from '@components/optionsDialog/optionsDialog';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { CaretDown, DotsThreeVertical } from '@phosphor-icons/react';
import { currencySymbolMap, type Account } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Input from '@ui-library/input';
import Sheet from '@ui-library/sheet';
import Spinner from '@ui-library/spinner';
import { EMPTY_LABEL, LoaderSize, OPTIONS_DIALOG_WIDTH } from '@utils/constants';
import { getAccountGradient } from '@utils/gradient';
import { isLedgerAccount, validateAccountName } from '@utils/helper';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import 'react-tooltip/dist/react-tooltip.css';
import Theme from 'theme';
import {
  AccountInfoContainer,
  AccountName,
  Balance,
  BarLoaderContainer,
  ButtonRow,
  Container,
  CurrentAccountContainer,
  CurrentAccountTextContainer,
  GradientCircle,
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
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const { t: optionsDialogTranslation } = useTranslation('translation', {
    keyPrefix: 'OPTIONS_DIALOG',
  });
  const { accountsList, ledgerAccountsList, fiatCurrency, accountBalances } = useWalletSelector();
  const totalBalance = accountBalances[account?.btcAddress ?? ''];
  const gradient = getAccountGradient(account?.stxAddress || account?.btcAddress!);
  const btcCopiedTooltipTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const stxCopiedTooltipTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const [showRemoveAccountModal, setShowRemoveAccountModal] = useState(false);
  const [showRenameAccountModal, setShowRenameAccountModal] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountNameError, setAccountNameError] = useState<string | null>(null);
  const [isAccountNameChangeLoading, setIsAccountNameChangeLoading] = useState(false);
  const [optionsDialogIndents, setOptionsDialogIndents] = useState<
    { top: string; left: string } | undefined
  >();
  const { removeLedgerAccount, renameAccount, updateLedgerAccounts } = useWalletReducer();

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
  }, [accountName]);

  const handleClick = () => {
    onAccountSelected(account!);
  };

  const openOptionsDialog = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShowOptionsDialog(true);

    setOptionsDialogIndents({
      top: `${(event.target as HTMLElement).parentElement?.getBoundingClientRect().top}px`,
      left: `calc(${
        (event.target as HTMLElement).parentElement?.getBoundingClientRect().right
      }px - ${OPTIONS_DIALOG_WIDTH}px)`,
    });
  };

  const closeOptionsDialog = () => {
    setShowOptionsDialog(false);
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

  const handleRemoveLedgerAccount = async () => {
    if (!account) {
      return;
    }

    try {
      await removeLedgerAccount(account);
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
        <GradientCircle
          $firstGradient={gradient[0]}
          $secondGradient={gradient[1]}
          $thirdGradient={gradient[2]}
          $isBig={isAccountListView}
          $isSelected={isSelected}
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
        <OptionsButton aria-label="Open Account Options" onClick={openOptionsDialog}>
          <DotsThreeVertical size={20} fill="white" />
        </OptionsButton>
      )}

      {showOptionsDialog && (
        <OptionsDialog closeDialog={closeOptionsDialog} optionsDialogIndents={optionsDialogIndents}>
          <ButtonRow onClick={handleRenameAccountModalOpen}>
            {optionsDialogTranslation('RENAME_ACCOUNT')}
          </ButtonRow>
          {isLedgerAccount(account) && (
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
                <Button
                  variant="danger"
                  title={t('REMOVE_WALLET')}
                  onClick={handleRemoveLedgerAccount}
                />
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
