import LedgerBadge from '@assets/img/ledger/ledger_badge.svg';
import BarLoader from '@components/barLoader';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import OptionsDialog, { OPTIONS_DIALOG_WIDTH } from '@components/optionsDialog/optionsDialog';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { CaretDown, DotsThreeVertical } from '@phosphor-icons/react';
import { Account, currencySymbolMap } from '@secretkeylabs/xverse-core';
import InputFeedback from '@ui-library/inputFeedback';
import Spinner from '@ui-library/spinner';
import { EMPTY_LABEL, LoaderSize, MAX_ACC_NAME_LENGTH } from '@utils/constants';
import { getAccountGradient } from '@utils/gradient';
import { isLedgerAccount, validateAccountName } from '@utils/helper';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import 'react-tooltip/dist/react-tooltip.css';
import styled from 'styled-components';

const GradientCircle = styled.div<{
  firstGradient: string;
  secondGradient: string;
  thirdGradient: string;
  isBig: boolean;
}>((props) => ({
  width: props.isBig ? 32 : 20,
  height: props.isBig ? 32 : 20,
  borderRadius: 25,
  background: `linear-gradient(to bottom,${props.firstGradient}, ${props.secondGradient},${props.thirdGradient} )`,
}));

const TopSectionContainer = styled.div<{ disableClick?: boolean }>((props) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'transparent',
  cursor: props.disableClick ? 'initial' : 'pointer',
}));

const AccountInfoContainer = styled.div({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
});

const CurrentAcountContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(6),
}));

const CurrentAccountTextContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: props.theme.space.xs,
}));

const AccountName = styled.h1<{ isSelected: boolean }>((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.isSelected ? props.theme.colors.white_0 : props.theme.colors.white_400,
  textAlign: 'start',
}));

const BarLoaderContainer = styled.div((props) => ({
  width: 200,
  paddingTop: props.theme.space.xxs,
  backgroundColor: 'transparent',
}));

const TransparentSpan = styled.span`
  background: transparent;
`;

const OptionsButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  background: 'transparent',
});

const ModalContent = styled.div((props) => ({
  padding: props.theme.spacing(8),
  paddingTop: props.theme.spacing(12),
  paddingBottom: props.theme.spacing(20),
}));

const ModalDescription = styled.div((props) => ({
  fontSize: '0.875rem',
  color: props.theme.colors.white_200,
}));

const ModalControlsContainer = styled.div((props) => ({
  display: 'flex',
  columnGap: props.theme.space.s,
  marginTop: props.theme.space.xl,
}));

const ModalButtonContainer = styled.div({
  width: '100%',
});

const ButtonRow = styled.button`
  display: flex;
  align-items: center;
  background-color: transparent;
  justify-content: flex-start;
  padding: ${(props) => props.theme.space.l};
  padding-top: ${(props) => props.theme.space.s};
  padding-bottom: ${(props) => props.theme.space.s};
  font: ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_0};
  transition: background-color 0.2s ease;
  :hover {
    background-color: ${(props) => props.theme.colors.elevation3};
  }
  :active {
    background-color: ${(props) => props.theme.colors.elevation3};
  }
`;

const InputLabel = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.xs,
}));

const InputContainer = styled.div<{ withError?: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(6),
  border: `1px solid ${
    props.withError ? props.theme.colors.danger_dark_200 : props.theme.colors.white_800
  }`,
  backgroundColor: props.theme.colors.elevation1,
  borderRadius: props.theme.radius(1),
  padding: props.theme.spacing(5),
}));

const InputField = styled.input((props) => ({
  ...props.theme.typography.body_m,
  backgroundColor: 'transparent',
  color: props.theme.colors.white_0,
  border: 'transparent',
  width: '100%',
  '&::-webkit-outer-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '&::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '&[type=number]': {
    '-moz-appearance': 'textfield',
  },
}));

const Balance = styled.div<{ isSelected?: boolean }>((props) => ({
  ...props.theme.typography.body_medium_m,
  marginTop: props.theme.space.xxs,
  color: props.isSelected ? props.theme.colors.white_200 : props.theme.colors.white_400,
  display: 'flex',
  alignItems: 'center',
  columnGap: props.theme.space.xs,
}));

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

  const getName = () => {
    const name =
      account?.accountName ??
      account?.bnsName ??
      `${t('ACCOUNT_NAME')} ${`${(account?.id ?? 0) + 1}`}`;

    return name.length > MAX_ACC_NAME_LENGTH ? `${name.slice(0, MAX_ACC_NAME_LENGTH)}...` : name;
  };

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

  return (
    <TopSectionContainer disableClick={disabledAccountSelect}>
      <AccountInfoContainer onClick={handleClick}>
        <GradientCircle
          firstGradient={gradient[0]}
          secondGradient={gradient[1]}
          thirdGradient={gradient[2]}
          isBig={isAccountListView}
        />
        <CurrentAcountContainer>
          {account && (
            <TransparentSpan>
              <CurrentAccountTextContainer>
                <AccountName isSelected={isSelected}>{getName()}</AccountName>
                {isLedgerAccount(account) && <img src={LedgerBadge} alt="Ledger icon" />}
                {isSelected && !disabledAccountSelect && !isAccountListView && (
                  <CaretDown weight="bold" size={16} />
                )}
              </CurrentAccountTextContainer>
              {isAccountListView && totalBalance && (
                <NumericFormat
                  value={totalBalance}
                  displayType="text"
                  prefix={`${currencySymbolMap[fiatCurrency]}`}
                  thousandSeparator
                  renderText={(value: string) => <Balance isSelected={isSelected}>{value}</Balance>}
                />
              )}
              {isAccountListView && !totalBalance && (
                <Balance isSelected={isSelected}>
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
        </CurrentAcountContainer>
      </AccountInfoContainer>

      {isAccountListView && (
        <OptionsButton onClick={openOptionsDialog}>
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
        <BottomModal
          visible={showRemoveAccountModal}
          header={t('REMOVE_FROM_LIST_TITLE')}
          onClose={handleRemoveAccountModalClose}
        >
          <ModalContent>
            <ModalDescription>{t('REMOVE_FROM_LIST_DESCRIPTION')}</ModalDescription>
            <ModalControlsContainer>
              <ModalButtonContainer>
                <ActionButton
                  transparent
                  text={t('CANCEL')}
                  onPress={handleRemoveAccountModalClose}
                />
              </ModalButtonContainer>
              <ModalButtonContainer>
                <ActionButton
                  warning
                  text={t('REMOVE_WALLET')}
                  onPress={handleRemoveLedgerAccount}
                />
              </ModalButtonContainer>
            </ModalControlsContainer>
          </ModalContent>
        </BottomModal>
      )}

      {showRenameAccountModal && (
        <BottomModal
          visible={showRenameAccountModal}
          header={optionsDialogTranslation('RENAME_ACCOUNT')}
          onClose={handleRenameAccountModalClose}
        >
          <ModalContent>
            <InputLabel>{optionsDialogTranslation('RENAME_ACCOUNT_MODAL.LABEL')}</InputLabel>
            <InputContainer withError={!!accountNameError}>
              <InputField
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                autoFocus
              />
            </InputContainer>
            {accountNameError && <InputFeedback variant="danger" message={accountNameError} />}
            <ModalControlsContainer>
              <ModalButtonContainer>
                <ActionButton
                  text={t('SAVE')}
                  onPress={handleRenameAccount}
                  processing={isAccountNameChangeLoading}
                />
              </ModalButtonContainer>
            </ModalControlsContainer>
          </ModalContent>
        </BottomModal>
      )}
    </TopSectionContainer>
  );
}

export default AccountRow;
