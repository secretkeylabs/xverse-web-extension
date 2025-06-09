import STXIcon from '@assets/img/dashboard/stx_icon.svg';
import BTCIcon from '@assets/img/hw/ledger/btc_icon.svg';
import { ButtonRow, OptionsButton } from '@components/accountRow/index.styled';
import OptionsDialog from '@components/optionsDialog/optionsDialog';
import useOptionsDialog from '@hooks/useOptionsDialog';
import { DotsThreeVertical } from '@phosphor-icons/react';
import type { AddressBookEntry } from '@secretkeylabs/xverse-core/addressBook/types';
import { StyledP } from '@ui-library/common.styled';
import Dialog from '@ui-library/dialog';
import SnackBar from '@ui-library/snackBar';
import { LONG_TOAST_DURATION } from '@utils/constants';
import { getTruncatedAddress } from '@utils/helper';
import RoutePaths from 'app/routes/paths';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Theme from 'theme';

const ItemContainer = styled.div<{ $isClickable: boolean; $isViewOnly: boolean }>((props) => ({
  display: 'flex',
  alignItems: 'center',
  gap: props.$isViewOnly ? props.theme.space.s : props.theme.space.m,
  cursor: props.$isClickable ? 'pointer' : 'default',
}));

const InitialCircle = styled.div((props) => ({
  flex: '1 0 auto',
  ...props.theme.typography.body_bold_l,
  width: 32,
  height: 32,
  borderRadius: '50%',
  backgroundColor: props.theme.colors.white_850,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ChainIconContainer = styled.div((props) => ({
  width: 20,
  height: 20,
  borderRadius: '50%',
  border: `2px solid ${props.theme.colors.elevation0}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  bottom: 0,
  right: -8,
  backgroundColor: props.theme.colors.elevation0,
}));

const ChainIcon = styled.img({
  width: 16,
  height: 16,
});

const InitialContainer = styled.div({
  position: 'relative',
});

const ContentContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.xxxs,
  overflow: 'hidden',
}));

const TruncatedStyledP = styled(StyledP)({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  minHeight: 19,
});

type Props = {
  item: AddressBookEntry;
  isViewOnly?: boolean;
  onSelect?: (address: string) => void;
  onDelete?: (item: AddressBookEntry, successCallback: () => void) => void;
  onUndoDelete?: (item: AddressBookEntry, successCallback: () => void) => void;
};

const getChainIconDetails = (chain: string) => {
  switch (chain) {
    case 'bitcoin':
      return { src: BTCIcon, alt: 'Bitcoin' };
    case 'stacks':
      return { src: STXIcon, alt: 'Stacks' };
    // Add more chains here in the future
    default:
      return { src: BTCIcon, alt: 'Bitcoin' };
  }
};

function AddressBookItem({ item, isViewOnly = false, onSelect, onDelete, onUndoDelete }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN.ADDRESS_BOOK' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const navigate = useNavigate();
  const menuDialog = useOptionsDialog();
  const [showRemoveAddressModal, setShowRemoveAddressModal] = useState(false);
  const initial = item.name.charAt(0).toUpperCase();

  const { src, alt } = getChainIconDetails(item.chain);

  const handleUndoDeleteAddress = (toastId: string) => {
    if (onUndoDelete) {
      onUndoDelete(item, () => {
        setShowRemoveAddressModal(false);
        toast.remove(toastId);
        toast(t('ADDRESS_RESTORED'));
      });
    }
  };

  const handleDeleteAddress = () => {
    if (onDelete) {
      onDelete(item, () => {
        setShowRemoveAddressModal(false);
        const toastId = toast(
          <SnackBar
            text={t('ADDRESS_DELETED')}
            type="neutral"
            action={{
              text: commonT('UNDO'),
              onClick: () => handleUndoDeleteAddress(toastId),
            }}
          />,
          { duration: LONG_TOAST_DURATION },
        );
      });
    }
  };

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(item.address);
    toast(t('ADDRESS_COPIED'));
  };

  return (
    <>
      <ItemContainer
        onClick={() => {
          if (onSelect) {
            onSelect(item.address);
          } else if (!isViewOnly) {
            navigate(RoutePaths.EditAddress(item.id));
          }
        }}
        $isClickable={!isViewOnly || !!onSelect}
        $isViewOnly={isViewOnly}
      >
        <InitialContainer>
          <InitialCircle>{initial}</InitialCircle>
          <ChainIconContainer>
            <ChainIcon src={src} alt={alt} />
          </ChainIconContainer>
        </InitialContainer>
        <ContentContainer>
          <TruncatedStyledP typography="body_bold_m">{item.name}</TruncatedStyledP>
          <StyledP typography="body_medium_m" color={isViewOnly ? 'white_200' : 'white_400'}>
            {getTruncatedAddress(item.address, 6)}
          </StyledP>
        </ContentContainer>
        {!isViewOnly && (
          <OptionsButton
            onClick={(e) => {
              e.stopPropagation();
              menuDialog.open(e);
            }}
          >
            <DotsThreeVertical size={20} fill="white" />
          </OptionsButton>
        )}
      </ItemContainer>

      {menuDialog.isVisible && (
        <OptionsDialog closeDialog={menuDialog.close} optionsDialogIndents={menuDialog.indents}>
          <ButtonRow onClick={handleCopyAddress}>{t('COPY_ADDRESS')}</ButtonRow>
          <ButtonRow
            onClick={() => {
              setShowRemoveAddressModal(true);
            }}
            $color={Theme.colors.danger_light}
          >
            {t('DELETE_ADDRESS')}
          </ButtonRow>
        </OptionsDialog>
      )}

      <Dialog
        visible={showRemoveAddressModal}
        title={t('DELETE_ADDRESS_DIALOG.TITLE', { name: item.name })}
        description={t('DELETE_ADDRESS_DIALOG.CONFIRMATION')}
        rightButtonText={commonT('DELETE')}
        onRightButtonClick={handleDeleteAddress}
        rightButtonDisabled={false}
        leftButtonText={commonT('CANCEL')}
        onLeftButtonClick={() => {
          setShowRemoveAddressModal(false);
        }}
        leftButtonDisabled={false}
        onClose={() => {
          setShowRemoveAddressModal(false);
        }}
        type="default"
      />
    </>
  );
}

export default AddressBookItem;
