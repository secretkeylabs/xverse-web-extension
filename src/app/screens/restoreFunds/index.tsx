import TopRow from '@components/topRow';
import useWalletSelector from '@hooks/useWalletSelector';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import AssetIcon from '@assets/img/transactions/Assets.svg';
import {
  BtcUtxoDataResponse, getBtcFiatEquivalent, NetworkType, satsToBtc,
} from '@secretkeylabs/xverse-core';
import {
  getBtcFeesForNonOrdinalBtcSend, SignedBtcTx, signNonOrdinalBtcSendTransaction, sumUnspentOutputs,
} from '@secretkeylabs/xverse-core/transactions/btc';
import { useMutation, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getTruncatedAddress } from '@utils/helper';
import ActionButton from '@components/button';
import BottomTabBar from '@components/tabBar';
import { useEffect } from 'react';
import FundsRow from './fundsRow';

const RestoreFundTitle = styled.h1((props) => ({
  ...props.theme.body_l,
  marginBottom: 15,
  color: props.theme.colors.white[200],
}));

const Container = styled.div({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  marginLeft: 16,
  marginTop: 32,
  marginRight: 16,
});

const ButtonContainer = styled.div({
  marginLeft: 16,
  marginBottom: 32,
  marginRight: 16,
});

function RestoreFunds() {
  const { t } = useTranslation('translation', { keyPrefix: 'RESTORE_FUNDS_SCREEN' });
  const {
    ordinalsAddress, btcAddress, network,
    selectedAccount, btcFiatRate,
    seedPhrase,
  } = useWalletSelector();
  const navigate = useNavigate();
  const location = useLocation();
  const { unspentUtxos } = location.state;
  let amount = new BigNumber(0);
  if (unspentUtxos) {
    amount = sumUnspentOutputs(unspentUtxos);
  }
  const isNoAmount = amount.isEqualTo(0);

  const { data: ordinalsFee, isLoading } = useQuery({
    queryKey: [`getFee-${ordinalsAddress}`],
    queryFn: () => getBtcFeesForNonOrdinalBtcSend(btcAddress, unspentUtxos as BtcUtxoDataResponse[], ordinalsAddress, 'Mainnet'),
  });

  const {
    error: errorSigningNonOrdial,
    data: signedNonOrdinalBtcSend,
    mutate: mutateSignNonOrdinalBtcTransaction,
  } = useMutation<SignedBtcTx,
  Error,
  {
    recipientAddress: string,
    nonOrdinalUtxos: Array<BtcUtxoDataResponse>,
    accountIndex: number,
    seedPhrase: string,
    network: NetworkType,
    fee?: BigNumber
  }
  >(async ({
    recipientAddress, nonOrdinalUtxos, accountIndex, seedPhrase, network, fee,
  }) => signNonOrdinalBtcSendTransaction(recipientAddress, nonOrdinalUtxos, accountIndex, seedPhrase, network, fee));

  const onClickTransfer = () => {
    mutateSignNonOrdinalBtcTransaction({
      recipientAddress: btcAddress,
      nonOrdinalUtxos: unspentUtxos as BtcUtxoDataResponse [],
      accountIndex: selectedAccount?.id ?? 0,
      seedPhrase,
      network: network.type,
      fee: ordinalsFee,
    });
  };

  useEffect(() => {
    if (errorSigningNonOrdial) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: errorSigningNonOrdial.toString(),
        },
      });
    }
  }, [errorSigningNonOrdial]);

  useEffect(() => {
    if (signedNonOrdinalBtcSend) {
      navigate('/confirm-btc-tx', {
        state: {
          signedTxHex: signedNonOrdinalBtcSend.signedTx,
          recipientAddress: btcAddress,
          amount,
          recipient: [
            {
              address: btcAddress,
              amountSats: new BigNumber(amount),
            },
          ],
          fiatAmount: getBtcFiatEquivalent(amount, btcFiatRate),
          fee: ordinalsFee,
          fiatFee: getBtcFiatEquivalent(ordinalsFee!, btcFiatRate),
          isRestoreFundFlow: true,
        },
      });
    }
  }, [signedNonOrdinalBtcSend]);

  const handleOnCancelClick = () => {
    navigate(-1);
  };

  return (
    <>
      <TopRow title={t('TITLE')} onClick={handleOnCancelClick} />
      <Container>
        {isNoAmount ? <RestoreFundTitle>{t('NO_FUNDS')}</RestoreFundTitle>
          : (
            <>
              <RestoreFundTitle>{t('DESCRIPTION')}</RestoreFundTitle>
              <FundsRow image={IconBitcoin} title={t('AMOUNT')} value={`${satsToBtc(amount)} BTC`} />
              <FundsRow image={AssetIcon} title={t('ORDINAL_ADDRESS')} value={getTruncatedAddress(ordinalsAddress)!} />
            </>
          )}

      </Container>
      <ButtonContainer>
        <ActionButton text={isNoAmount ? t('BACK') : t('TRANSFER')} onPress={isNoAmount ? handleOnCancelClick : onClickTransfer} />
      </ButtonContainer>
      <BottomTabBar tab="nft" />
    </>
  );
}

export default RestoreFunds;
