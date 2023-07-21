import styled from 'styled-components';
import XverseLogo from '@assets/img/settings/logo.svg';
import DropDownIcon from '@assets/img/transactions/dropDownIcon.svg';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import DappPlaceholderIcon from '@assets/img/webInteractions/authPlaceholder.svg';
import useWalletSelector from '@hooks/useWalletSelector';
import AccountRow from '@components/accountRow';
import { animated, useSpring } from '@react-spring/web';
import Seperator from '@components/seperator';
import { Account } from '@secretkeylabs/xverse-core';
import { useDispatch } from 'react-redux';
import { selectAccount } from '@stores/wallet/actions/actionCreators';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import ActionButton from '@components/button';
import useBtcAddressRequest from '@hooks/useBtcAddressRequest';
import { AddressPurposes } from 'sats-connect';
import { useNavigate } from 'react-router-dom';
import AccountView from './accountView';

const TitleContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  marginLeft: 30,
  marginRight: 30,
});

const DropDownContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  height: '100%',
  alignItems: 'center',
  justifyContent: 'flex-end',
});

const LogoContainer = styled.div((props) => ({
  padding: props.theme.spacing(11),
  marginBottom: props.theme.spacing(16),
  borderBottom: `1px solid ${props.theme.colors.background.elevation3}`,
}));

const AddressContainer = styled.div((props) => ({
  background: props.theme.colors.background.elevation2,
  borderRadius: 40,
  height: 24,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3px 10px 3px 6px',
  marginTop: props.theme.spacing(4),
  marginRight: props.theme.spacing(2),
}));

const AccountListContainer = styled(animated.div)((props) => ({
  paddingBottom: 20,
  width: '100%',
  borderRadius: 12,
  height: 214,
  marginTop: props.theme.spacing(9.5),
  boxShadow: '0px 8px 104px rgba(0, 0, 0, 0.5)',
  background: props.theme.colors.background.elevation2,
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  overflowY: 'auto',
}));

const TopImage = styled.img({
  aspectRatio: 1,
  height: 88,
  borderWidth: 10,
  borderColor: 'white',
});

const FunctionTitle = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  color: props.theme.colors.white['0'],
  marginTop: 16,
}));

const AccountContainer = styled.button((props) => ({
  background: props.theme.colors.background.elevation1,
  border: `1px solid ${props.theme.colors.background.elevation3}`,
  borderRadius: 8,
  width: '100%',
  padding: '12px 16px',
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(4),
  ':hover': {
    background: props.theme.colors.background.elevation2,
  },
}));

const AccountText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['400'],
  marginTop: 24,
}));

const DappTitle = styled.h2((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['200'],
  marginTop: 12,
  textAlign: 'center',
}));

const AddressTextTitle = styled.h1((props) => ({
  ...props.theme.body_medium_l,
  color: props.theme.colors.white['0'],
  fontSize: 10,
  textAlign: 'center',
}));

const OuterContainer = styled(animated.div)({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: 16,
  marginRight: 16,
});

const ButtonsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: props.theme.spacing(20),
  marginTop: 82,
}));

const BitcoinDot = styled.div((props) => ({
  borderRadius: 20,
  background: props.theme.colors.feedback.caution,
  width: 6,
  marginRight: props.theme.spacing(3),
  height: 6,
}));

const AccountListRow = styled.div((props) => ({
  paddingLeft: 16,
  paddingRight: 16,
  ':hover': {
    background: props.theme.colors.background.elevation3,
  },
}));

const TransparentButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(2),
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

const OrdinalImage = styled.img({
  width: 12,
  height: 12,
  marginRight: 8,
});

function BtcSelectAddressScreen() {
  const [loading, setLoading] = useState(false);
  const [showAccountList, setShowAccountList] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'SELECT_BTC_ADDRESS_SCREEN' });
  const { selectedAccount, accountsList, ledgerAccountsList, network } = useWalletSelector();
  const { payload, approveBtcAddressRequest, cancelAddressRequest } = useBtcAddressRequest();
  const springProps = useSpring({
    transform: showAccountList ? 'translateY(0%)' : 'translateY(100%)',
    opacity: showAccountList ? 1 : 0,
    config: {
      tension: 160,
      friction: 25,
    },
  });
  const styles = useSpring({
    from: {
      opacity: 0,
      y: 24,
    },
    to: {
      y: 0,
      opacity: 1,
    },
  });

  const confirmCallback = async () => {
    setLoading(true);
    approveBtcAddressRequest();
    window.close();
  };

  const cancelCallback = () => {
    cancelAddressRequest();
    window.close();
  };

  const onChangeAccount = () => {
    setShowAccountList(true);
  };

  const isAccountSelected = (account: Account) => account.id === selectedAccount?.id;

  const handleAccountSelect = (account: Account) => {
    dispatch(
      selectAccount(
        account,
        account.stxAddress,
        account.btcAddress,
        account.ordinalsAddress,
        account.masterPubKey,
        account.stxPublicKey,
        account.btcPublicKey,
        account.ordinalsPublicKey,
        network,
        undefined,
        account.accountType,
        account.accountName
      )
    );
    setShowAccountList(false);
  };

  const switchAccountBasedOnRequest = () => {
    if (payload.network.type !== network.type) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          errorTitle: t('NETWORK_MISMATCH_ERROR_TITLE'),
          error: t('NETWORK_MISMATCH_ERROR_DESCRIPTION'),
          browserTx: true,
        },
      });
    }
  };

  useEffect(() => {
    switchAccountBasedOnRequest();
  }, []);

  return (
    <>
      <LogoContainer>
        <img src={XverseLogo} alt="xverse logo" />
      </LogoContainer>
      <OuterContainer style={styles}>
        <TitleContainer>
          <TopImage src={DappPlaceholderIcon} alt="Dapp Logo" />
          <FunctionTitle>{t('TITLE')}</FunctionTitle>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {payload.purposes.map((purpose) =>
              purpose === AddressPurposes.PAYMENT ? (
                <AddressContainer>
                  <BitcoinDot />
                  <AddressTextTitle>{t('BITCOIN_ADDRESS')}</AddressTextTitle>
                </AddressContainer>
              ) : (
                <AddressContainer>
                  <OrdinalImage src={OrdinalsIcon} />
                  <AddressTextTitle>{t('ORDINAL_ADDRESS')}</AddressTextTitle>
                </AddressContainer>
              )
            )}
          </div>
          <DappTitle>{payload.message}</DappTitle>
        </TitleContainer>
        {showAccountList ? (
          <AccountListContainer style={springProps}>
            {[...accountsList, ...ledgerAccountsList].map((account) => (
              <AccountListRow>
                <AccountRow
                  key={account.stxAddress}
                  account={account}
                  isSelected={isAccountSelected(account)}
                  onAccountSelected={handleAccountSelect}
                  showOrdinalAddress
                />
                <Seperator />
              </AccountListRow>
            ))}
          </AccountListContainer>
        ) : (
          <>
            <AccountText>{t('ACCOUNT')}</AccountText>
            <AccountContainer onClick={onChangeAccount}>
              <AccountView account={selectedAccount!} isBitcoinTx />
              <DropDownContainer>
                <img src={DropDownIcon} alt="Drop Down" />
              </DropDownContainer>
            </AccountContainer>
            <ButtonsContainer>
              <TransparentButtonContainer>
                <ActionButton text={t('CANCEL_BUTTON')} transparent onPress={cancelCallback} />
              </TransparentButtonContainer>
              <ActionButton
                text={t('CONNECT_BUTTON')}
                processing={loading}
                onPress={confirmCallback}
              />
            </ButtonsContainer>
          </>
        )}
      </OuterContainer>
    </>
  );
}

export default BtcSelectAddressScreen;
