import styled from 'styled-components';
import { getAccountGradient } from '@utils/gradient';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import { useTranslation } from 'react-i18next';
import { getTruncatedAddress, getAddressDetail, isHardwareAccount } from '@utils/helper';
import BarLoader from '@components/barLoader';
import Copy from '@assets/img/Copy.svg';
import { LoaderSize } from '@utils/constants';
import { Account } from '@secretkeylabs/xverse-core';
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  ChangeShowBtcReceiveAlertAction,
  selectAccount,
} from '@stores/wallet/actions/actionCreators';
import useWalletSelector from '@hooks/useWalletSelector';
import LedgerBadge from '@assets/img/ledger/ledger_badge.svg';
import threeDotsIcon from '@assets/img/dots_three_vertical.svg';
import ActionButton from '@components/button';
import BottomModal from '@components/bottomModal';
import useWalletReducer from '@hooks/useWalletReducer';
import useResetUserFlow from '@hooks/useResetUserFlow';
import OptionsDialog from '@components/optionsDialog/optionsDialog';

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
});

interface GradientCircleProps {
  firstGradient: string;
  secondGradient: string;
  thirdGradient: string;
}
const GradientCircle = styled.div<GradientCircleProps>((props) => ({
  width: 40,
  height: 40,
  borderRadius: 25,
  background: `linear-gradient(to bottom,${props.firstGradient}, ${props.secondGradient},${props.thirdGradient} )`,
}));

const TopSectionContainer = styled.div((props) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: props.theme.spacing(8),
  backgroundColor: 'transparent',
  cursor: 'pointer',
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

const CurrentAccountDetailText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
  marginTop: props.theme.spacing(1),
  display: 'flex',
  justifyContent: 'flex-start',
}));

const BarLoaderContainer = styled.div((props) => ({
  width: 200,
  paddingTop: props.theme.spacing(2),
  backgroundColor: 'transparent',
}));

const CopyImage = styled.img((props) => ({
  marginRight: props.theme.spacing(2),
}));

export const StyledToolTip = styled(Tooltip)`
  background-color: #ffffff;
  color: #12151e;
  border-radius: 8px;
  padding: 7px;
`;

const AddressContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
});

const TransparentSpan = styled.span`
  background: transparent;
`;

const CopyButton = styled.button`
  opacity: 0.6;
  color: #ffffff;
  margin-top: 3px;
  margin-right: 10px;
  display: flex;
  title: Bitcoin;
  flexdirection: row;
  alignitems: center;
  justifycontent: center;
  background: transparent;
  :hover {
    opacity: 1;
  }
  :focus {
    opacity: 1;
  }
`;

const OrdinalImage = styled.img((props) => ({
  width: 12,
  height: 12,
  marginRight: props.theme.spacing(2),
}));

const AddressText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginTop: props.theme.spacing(1),
  color: props.theme.colors.white['400'],
}));

const BitcoinDot = styled.div((props) => ({
  borderRadius: 20,
  backgroundColor: props.theme.colors.feedback.caution,
  width: 10,
  height: 10,
  marginRight: props.theme.spacing(2),
  marginLeft: props.theme.spacing(2),
}));

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

interface Props {
  account: Account | null;
  isSelected: boolean;
  allowCopyAddress?: boolean;
  showOrdinalAddress?: boolean;
  onAccountSelected: (account: Account) => void;
  withOptions?: boolean;
}

function AccountRow({
  account,
  isSelected,
  onAccountSelected,
  allowCopyAddress,
  showOrdinalAddress,
  withOptions,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const { t: optionsDialogTranslation } = useTranslation('translation', {
    keyPrefix: 'OPTIONS_DIALOG',
  });
  const { showBtcReceiveAlert, accountsList, network } = useWalletSelector();
  const gradient = getAccountGradient(account?.stxAddress || account?.btcAddress!);
  const [onStxCopied, setOnStxCopied] = useState(false);
  const [onBtcCopied, setOnBtcCopied] = useState(false);
  const dispatch = useDispatch();
  const btcCopiedTooltipTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const stxCopiedTooltipTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const [showRemoveAccountModal, setShowRemoveAccountModal] = useState(false);
  const [optionsDialogTopIndent, setOptionsDialogTopIndent] = useState<string>('0px');
  const { removeLedgerAccount } = useWalletReducer();
  const { broadcastResetUserFlow } = useResetUserFlow();

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

  const handleOnBtcAddressClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard.writeText(account?.btcAddress!);
    setOnBtcCopied(true);
    setOnStxCopied(false);
    // set 'Copied' text back to 'Bitcoin address' after 3 seconds
    btcCopiedTooltipTimeoutRef.current = setTimeout(() => setOnBtcCopied(false), 3000);
    if (showBtcReceiveAlert !== null) {
      dispatch(ChangeShowBtcReceiveAlertAction(true));
    }
    event.stopPropagation();
  };

  const handleOnStxAddressClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard.writeText(account?.stxAddress!);
    setOnStxCopied(true);
    setOnBtcCopied(false);
    // set 'Copied' text back to 'Stacks address' after 3 seconds
    stxCopiedTooltipTimeoutRef.current = setTimeout(() => setOnStxCopied(false), 3000);
    event.stopPropagation();
  };

  const handleClick = () => {
    onAccountSelected(account!);
  };

  const openOptionsDialog = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShowOptionsDialog(true);

    setOptionsDialogTopIndent(
      `${(event.target as HTMLElement).parentElement?.getBoundingClientRect().top}px`,
    );
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

  const handleAccountSelect = (newAccount: Account) => {
    dispatch(
      selectAccount(
        newAccount,
        newAccount.stxAddress,
        newAccount.btcAddress,
        newAccount.ordinalsAddress,
        newAccount.masterPubKey,
        newAccount.stxPublicKey,
        newAccount.btcPublicKey,
        newAccount.ordinalsPublicKey,
        network,
        undefined,
        newAccount.accountType,
        newAccount.accountName,
      ),
    );
    broadcastResetUserFlow();
  };

  const handleRemoveLedgerAccount = async () => {
    try {
      await removeLedgerAccount(account!);
      handleAccountSelect(accountsList[0]);
      handleRemoveAccountModalClose();
    } catch (err) {
      console.error(err);
    }
  };

  const showOrdinalBtcAddress = (
    <RowContainer>
      <AddressContainer>
        <OrdinalImage src={OrdinalsIcon} />
        <AddressText>{`${getTruncatedAddress(account?.ordinalsAddress!)} / `}</AddressText>
      </AddressContainer>
      <AddressContainer>
        <BitcoinDot />
        <AddressText>{`${getTruncatedAddress(account?.btcAddress!)}`}</AddressText>
      </AddressContainer>
    </RowContainer>
  );

  const displayAddress = allowCopyAddress ? (
    <RowContainer>
      <CopyButton id="bitcoin-address" onClick={handleOnBtcAddressClick}>
        <CopyImage src={Copy} alt="copy" />
        <CurrentUnSelectedAccountText>
          {getTruncatedAddress(account?.btcAddress!)}
        </CurrentUnSelectedAccountText>
      </CopyButton>
      <StyledToolTip
        anchorId="bitcoin-address"
        variant="light"
        content={onBtcCopied ? 'Copied' : 'Bitcoin address'}
        events={['hover']}
        place="bottom"
      />

      <CopyButton id="stacks-address" onClick={handleOnStxAddressClick}>
        <CopyImage src={Copy} alt="copy" />
        <CurrentUnSelectedAccountText>
          {getTruncatedAddress(account?.stxAddress!)}
        </CurrentUnSelectedAccountText>
      </CopyButton>
      <StyledToolTip
        anchorId="stacks-address"
        variant="light"
        content={onStxCopied ? 'Copied' : 'Stacks address'}
        events={['hover']}
        place="bottom"
      />
    </RowContainer>
  ) : (
    <CurrentAccountDetailText>
      {showOrdinalAddress ? showOrdinalBtcAddress : getAddressDetail(account!)}
    </CurrentAccountDetailText>
  );

  return (
    <TopSectionContainer>
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
              </CurrentAccountTextContainer>
            </TransparentSpan>
          )}

          {!!account && !isHardwareAccount(account) && displayAddress}

          {!account && (
            <BarLoaderContainer>
              <BarLoader loaderSize={LoaderSize.LARGE} />
              <BarLoader loaderSize={LoaderSize.MEDIUM} />
            </BarLoaderContainer>
          )}
        </CurrentAcountContainer>
      </AccountInfoContainer>

      {!!withOptions && isHardwareAccount(account) && (
        <OptionsButton onClick={openOptionsDialog}>
          <img src={threeDotsIcon} alt="Options" />
        </OptionsButton>
      )}

      {showOptionsDialog && (
        <OptionsDialog
          closeDialog={closeOptionsDialog}
          optionsDialogTopIndent={optionsDialogTopIndent}
        >
          <ButtonRow onClick={handleRemoveAccountModalClose}>
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
