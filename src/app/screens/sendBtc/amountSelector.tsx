import useWalletSelector from '@hooks/useWalletSelector';
import { getBtcFiatEquivalent } from '@secretkeylabs/xverse-core';
import BtcAmountSelector from '@ui-components/btcAmountSelector';
import SelectFeeRate from '@ui-components/selectFeeRate';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1 1 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Buttons = styled.div`
  margin: ${(props) => props.theme.spacing(12)}px 0;
`;

type Props = {
  amountSats: string;
  setAmountSats: (amount: string) => void;
  feeRate: string;
  setFeeRate: (feeRate: string) => void;
  sendMax: boolean;
  setSendMax: (sendMax: boolean) => void;
  fee: string | undefined;
  getFeeForFeeRate: (feeRate: number, useEffectiveFeeRate?: boolean) => Promise<number>;
  onNext: () => void;
  dustFiltered: boolean;
  isLoading?: boolean;
};

function AmountSelector({
  amountSats,
  setAmountSats,
  feeRate,
  setFeeRate,
  sendMax,
  setSendMax,
  fee,
  getFeeForFeeRate,
  onNext,
  isLoading,
  dustFiltered,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { btcFiatRate, fiatCurrency } = useWalletSelector();

  const handleNext = () => {
    // TODO: validate amount - get fee summary from enhanced txn and ensure amount is payable
    // TODO: Insufficient funds error handling
    onNext();
  };

  const satsToFiat = (sats: string) =>
    getBtcFiatEquivalent(new BigNumber(sats), BigNumber(btcFiatRate)).toNumber().toFixed(2);

  return (
    <Container>
      <div>
        <BtcAmountSelector
          amountSats={amountSats}
          setAmountSats={setAmountSats}
          sendMax={sendMax}
          setSendMax={setSendMax}
          disabled={isLoading}
        />
        <SelectFeeRate
          fee={fee}
          feeUnits="Sats"
          feeRate={feeRate}
          feeRateUnits="sats/vB"
          setFeeRate={setFeeRate}
          baseToFiat={satsToFiat}
          fiatUnit={fiatCurrency}
          getFeeForFeeRate={getFeeForFeeRate}
          isLoading={isLoading}
        />
        {sendMax && dustFiltered && <Callout bodyText={t('BTC.MAX_IGNORING_DUST_UTXO_MSG')} />}
      </div>
      <Buttons>
        <Button title={t('NEXT')} onClick={handleNext} loading={isLoading} />
      </Buttons>
    </Container>
  );
}

export default AmountSelector;
