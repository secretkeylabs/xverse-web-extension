import TopRow from '@components/topRow';
import useCanUserSwitchPaymentType from '@hooks/useCanUserSwitchPaymentType';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  ChangeActivateOrdinalsAction,
  ChangeActivateRareSatsAction,
  ChangeActivateRBFAction,
} from '@stores/wallet/actions/actionCreators';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Title } from '../index.styles';
import SettingComponent from '../settingComponent';

function AdvancedSettings() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    hasActivatedOrdinalsKey,
    hasActivatedRareSatsKey,
    hasActivatedRBFKey,
    btcPaymentAddressType,
  } = useWalletSelector();
  const selectedAccount = useSelectedAccount();
  const showBtcAddressTypeSelector = useCanUserSwitchPaymentType();

  const isLedgerAccountSelected = isLedgerAccount(selectedAccount);

  const onPreferredAddressClick = () => {
    navigate('/preferred-address');
  };

  const switchActivateOrdinalState = () => {
    dispatch(ChangeActivateOrdinalsAction(!hasActivatedOrdinalsKey));
    // disable rare sats if ordinal is disabled
    dispatch(ChangeActivateRareSatsAction(false));
  };

  const switchActivateRareSatsState = () => {
    dispatch(ChangeActivateRareSatsAction(!hasActivatedRareSatsKey));
  };

  const switchActivateRBFState = () => {
    dispatch(ChangeActivateRBFAction(!hasActivatedRBFKey));
  };

  const onRestoreFundClick = async () => {
    if (isLedgerAccountSelected && !isInOptions()) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL('options.html#/restore-funds'),
      });
      return;
    }

    navigate('/restore-funds');
  };

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const payAddressType =
    btcPaymentAddressType === 'native'
      ? t('PREFERRED_BTC_ADDRESS.NATIVE_SEGWIT')
      : t('PREFERRED_BTC_ADDRESS.NESTED_SEGWIT');

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <Title>{t('ADVANCED')}</Title>
        {showBtcAddressTypeSelector && (
          <SettingComponent
            text={t('PREFERRED_BTC_ADDRESS.TITLE')}
            textDetail={payAddressType}
            onClick={onPreferredAddressClick}
            showDivider
          />
        )}
        <SettingComponent
          text={t('ENABLE_SPEED_UP_TRANSACTIONS')}
          description={t('ENABLE_SPEED_UP_TRANSACTIONS_DETAIL')}
          toggle
          toggleFunction={switchActivateRBFState}
          toggleValue={hasActivatedRBFKey}
          showDivider
        />
        <SettingComponent
          text={t('ACTIVATE_ORDINAL_NFTS')}
          description={t('ENABLE_ORDINALS_DETAIL')}
          toggle
          toggleFunction={switchActivateOrdinalState}
          toggleValue={hasActivatedOrdinalsKey}
          showDivider
        />
        <SettingComponent
          text={t('ENABLE_RARE_SATS')}
          description={t('ENABLE_RARE_SATS_DETAIL')}
          toggle
          toggleFunction={switchActivateRareSatsState}
          toggleValue={hasActivatedRareSatsKey}
          disabled={!hasActivatedOrdinalsKey}
          showDivider
        />
        <SettingComponent text={t('RECOVER_ASSETS')} onClick={onRestoreFundClick} />
      </Container>
    </>
  );
}

export default AdvancedSettings;
