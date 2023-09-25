import TopRow from '@components/topRow';
import useWalletSelector from '@hooks/useWalletSelector';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import {
  BtcUtxoDataResponse,
  getBtcFiatEquivalent,
  NetworkType,
  satsToBtc,
  UTXO,
} from '@secretkeylabs/xverse-core';
import {
  getBtcFeesForNonOrdinalBtcSend,
  SignedBtcTx,
  signNonOrdinalBtcSendTransaction,
  sumUnspentOutputs,
} from '@secretkeylabs/xverse-core/transactions/btc';
import { useMutation, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ActionButton from '@components/button';
import BottomTabBar from '@components/tabBar';
import { useEffect } from 'react';
import useNonOrdinalUtxos from '@hooks/useNonOrdinalUtxo';

const RestoreFundTitle = styled.h1((props) => ({
  ...props.theme.body_l,
  marginBottom: 32,
  color: props.theme.colors.white_200,
}));

const BtcCard = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  background: props.theme.colors.elevation1,
  borderRadius: 8,
  padding: '16px 12px',
}));

const Icon = styled.img((props) => ({
  marginRight: props.theme.spacing(6),
  width: 32,
  height: 32,
  borderRadius: 30,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white_400,
}));

const BtcContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

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

function RestoreBtc() {
  const { t } = useTranslation('translation', { keyPrefix: 'RESTORE_BTC_SCREEN' });
  const { ordinalsAddress, btcAddress, network, selectedAccount, btcFiatRate, seedPhrase } =
    useWalletSelector();
  const navigate = useNavigate();
  const { unspentUtxos } = useNonOrdinalUtxos();
  let amount = new BigNumber(0);
  if (unspentUtxos) {
    amount = sumUnspentOutputs(unspentUtxos);
  }
  const isNoAmount = amount.isEqualTo(0) || !unspentUtxos[0]?.status.confirmed;

  const { data: ordinalsFee } = useQuery({
    queryKey: [`getFee-${ordinalsAddress}`],
    queryFn: () =>
      getBtcFeesForNonOrdinalBtcSend(btcAddress, unspentUtxos, ordinalsAddress, network.type),
  });

  const {
    error: errorSigningNonOrdial,
    data: signedNonOrdinalBtcSend,
    mutate: mutateSignNonOrdinalBtcTransaction,
  } = useMutation<
    SignedBtcTx,
    Error,
    {
      recipientAddress: string;
      nonOrdinalUtxos: Array<UTXO>;
      accountIndex: number;
      seedPhrase: string;
      network: NetworkType;
      fee?: BigNumber;
    }
  >({
    mutationFn: async ({
      recipientAddress,
      nonOrdinalUtxos,
      accountIndex,
      seedPhrase,
      network,
      fee,
    }) =>
      signNonOrdinalBtcSendTransaction(
        recipientAddress,
        nonOrdinalUtxos,
        accountIndex,
        seedPhrase,
        network,
        fee,
      ),
  });

  const onClickTransfer = () => {
    mutateSignNonOrdinalBtcTransaction({
      recipientAddress: btcAddress,
      nonOrdinalUtxos: unspentUtxos,
      accountIndex: selectedAccount?.id ?? 0,
      seedPhrase,
      network: network.type,
      fee: ordinalsFee?.fee,
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
          fee: ordinalsFee?.fee,
          feePerVByte: ordinalsFee?.selectedFeeRate,
          fiatFee: getBtcFiatEquivalent(ordinalsFee?.fee!, btcFiatRate),
          isRestoreFundFlow: true,
          unspentUtxos,
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
        {isNoAmount ? (
          <RestoreFundTitle>{t('NO_FUNDS')}</RestoreFundTitle>
        ) : (
          <>
            <RestoreFundTitle>{t('DESCRIPTION')}</RestoreFundTitle>
            <BtcCard>
              <Icon src={IconBitcoin} />
              <BtcContainer>
                <TitleText>{`${satsToBtc(amount)} BTC`}</TitleText>
                <ValueText>{t('BTC')}</ValueText>
              </BtcContainer>
            </BtcCard>
          </>
        )}
      </Container>
      <ButtonContainer>
        <ActionButton
          text={isNoAmount ? t('BACK') : t('TRANSFER')}
          onPress={isNoAmount ? handleOnCancelClick : onClickTransfer}
        />
      </ButtonContainer>
      <BottomTabBar tab="nft" />
    </>
  );
}

export default RestoreBtc;