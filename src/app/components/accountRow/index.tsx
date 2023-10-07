import threeDotsIcon from '@assets/img/dots_three_vertical.svg';
import LedgerBadge from '@assets/img/ledger/ledger_badge.svg';
import BarLoader from '@components/barLoader';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import OptionsDialog, { OPTIONS_DIALOG_WIDTH } from '@components/optionsDialog/optionsDialog';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { CaretDown } from '@phosphor-icons/react';
import { Account } from '@secretkeylabs/xverse-core';
import { LoaderSize } from '@utils/constants';
import { getAccountGradient } from '@utils/gradient';
import { isHardwareAccount } from '@utils/helper';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import styled from 'styled-components';

interface GradientCircleProps {
  firstGradient: string;
  secondGradient: string;
  thirdGradient: string;
}
const GradientCircle = styled.div<GradientCircleProps>((props) => ({
  width: 20,
  height: 20,
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
  gap: props.theme.spacing(4),
}));

const CurrentSelectedAccountText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['0'],
  textAlign: 'start',
}));

const CurrentUnSelectedAccountText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
  textAlign: 'start',
}));

const BarLoaderContainer = styled.div((props) => ({
  width: 200,
  paddingTop: props.theme.spacing(2),
  backgroundColor: 'transparent',
}));

export const StyledToolTip = styled(Tooltip)`
  background-color: #ffffff;
  color: #12151e;
  border-radius: 8px;
  padding: 7px;
`;

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
  color: props.theme.colors.white['200'],
  marginBottom: props.theme.spacing(16),
}));

const ModalControlsContainer = styled.div({
  display: 'flex',
});

const ModalButtonContainer = styled.div((props) => ({
  width: '100%',
  '&:first-child': {
    marginRight: props.theme.spacing(6),
  },
}));

const ButtonRow = styled.button`
  display: flex;
  align-items: center;
  background-color: transparent;
  justify-content: flex-start;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 11px;
  padding-bottom: 11px;
  font: ${(props) => props.theme.body_medium_m};
  color: ${(props) => props.theme.colors.white['0']};
  transition: background-color 0.2s ease;
  :hover {
    background-color: ${(props) => props.theme.colors.background.elevation3};
  }
  :active {
    background-color: ${(props) => props.theme.colors.background.elevation3};
  }
`;

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
  const { accountsList } = useWalletSelector();
  const gradient = getAccountGradient(account?.stxAddress || account?.btcAddress!);
  const btcCopiedTooltipTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const stxCopiedTooltipTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const [showRemoveAccountModal, setShowRemoveAccountModal] = useState(false);
  const [optionsDialogIndents, setOptionsDialogIndents] = useState<
    { top: string; left: string } | undefined
  >();
  const { removeLedgerAccount } = useWalletReducer();

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

    return name.length > 20 ? `${name.slice(0, 20)}...` : name;
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

  return (
    <TopSectionContainer disableClick={disabledAccountSelect}>
      <AccountInfoContainer onClick={handleClick}>
        <GradientCircle
          firstGradient={gradient[0]}
          secondGradient={gradient[1]}
          thirdGradient={gradient[2]}
        />
        <CurrentAcountContainer>
          {account && (
            <TransparentSpan>
              <CurrentAccountTextContainer>
                {isSelected ? (
                  <CurrentSelectedAccountText>{getName()}</CurrentSelectedAccountText>
                ) : (
                  <CurrentUnSelectedAccountText>{getName()}</CurrentUnSelectedAccountText>
                )}
                {isHardwareAccount(account) && <img src={LedgerBadge} alt="Ledger icon" />}
                {isSelected && !disabledAccountSelect && <CaretDown weight="bold" size={16} />}
              </CurrentAccountTextContainer>
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

      {isAccountListView && isHardwareAccount(account) && (
        <OptionsButton onClick={openOptionsDialog}>
          <img src={threeDotsIcon} alt="Options" />
        </OptionsButton>
      )}

      {showOptionsDialog && (
        <OptionsDialog closeDialog={closeOptionsDialog} optionsDialogIndents={optionsDialogIndents}>
          <ButtonRow onClick={handleRemoveAccountModalOpen}>
            {optionsDialogTranslation('REMOVE_FROM_LIST')}
          </ButtonRow>
        </OptionsDialog>
      )}

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
              <ActionButton warning text={t('REMOVE_WALLET')} onPress={handleRemoveLedgerAccount} />
            </ModalButtonContainer>
          </ModalControlsContainer>
        </ModalContent>
      </BottomModal>
    </TopSectionContainer>
  );
}

export default AccountRow;
