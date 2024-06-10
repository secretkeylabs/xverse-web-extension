import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import { MESSAGE_SOURCE } from '@common/types/message-types';
import {
  sendInternalErrorMessage,
  sendUserRejectionMessage,
} from '@common/utils/rpc/stx/rpcResponseMessages';
import AccountHeaderComponent from '@components/accountHeader';
import ConfirmAddStakedBitcoinComponent from '@components/confirmAddStakedBitcoinComponent';
import InfoContainer from '@components/infoContainer';
import StakedAddressComponent from '@components/stakedAddressComponent';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useAddStakedBitcoin from '@hooks/useAddStakedBitcoin';

import useOnOriginTabClose from '@hooks/useOnTabClosed';
import { microstacksToStx } from '@secretkeylabs/xverse-core';

import { stakedBitcoins } from '@utils/stakes';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const AlertContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(12),
}));

function ConfirmAddStakedBitcoin() {
  const { t } = useTranslation('translation');
  const [hasTabClosed, setHasTabClosed] = useState(false);
  const navigate = useNavigate();

  const { refetch } = useStxWalletData();

  const { approveAddStakedBitcoinRequest, cancelAddStakedBitcoinRequest, tabId, network, payload } =
    useAddStakedBitcoin();

  const recipient = '0XXXXXXX'; // addressToString(txPayload.recipient.address);
  const txPayload = {
    amount: 1000000000,
  };
  const amount = new BigNumber(txPayload.amount.toString(10));
  const locktime = 1718030949876;
  useOnOriginTabClose(Number(tabId), () => {
    setHasTabClosed(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmClick = async () => {
    setIsLoading(true);
    await stakedBitcoins.add(payload.address, payload.script);
    approveAddStakedBitcoinRequest();
    window.close();
  };

  const handleCancelClick = () => {
    cancelAddStakedBitcoinRequest();
    window.close();
  };

  return (
    <>
      <TopRow title={t('STAKES.CONFIRM_ADD_STAKED_BITCOIN')} onClick={handleCancelClick} />

      <ConfirmAddStakedBitcoinComponent
        loading={isLoading}
        onConfirmClick={handleConfirmClick}
        onCancelClick={handleCancelClick}
      >
        <StakedAddressComponent
          address={payload.address}
          script={payload.script}
          locktime={locktime}
          value="0"
          icon={IconBitcoin}
          currencyType="BTC"
          title={t('CONFIRM_TRANSACTION.AMOUNT')}
        />
        {/* {showSpendDelegateStxWarning && (
          <SpendDelegatedStxWarning variant="warning" bodyText={t('SEND.SPEND_DELEGATED_STX')} />
        )} */}

        <TransactionDetailComponent title={t('CONFIRM_TRANSACTION.NETWORK')} value={network.type} />
        {hasTabClosed && (
          <AlertContainer>
            <InfoContainer
              titleText={t('WINDOW_CLOSED_ALERT.TITLE')}
              bodyText={t('WINDOW_CLOSED_ALERT.BODY')}
            />
          </AlertContainer>
        )}
      </ConfirmAddStakedBitcoinComponent>
    </>
  );
}

export default ConfirmAddStakedBitcoin;
