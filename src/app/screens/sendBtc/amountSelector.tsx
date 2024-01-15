import BtcAmountSelector from '@ui-components/btcAmountSelector';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1 1 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

type Props = {
  amountSats: string;
  setAmountSats: (amount: string) => void;
  feeRate: string;
  setFeeRate: (feeRate: string) => void;
  sendMax: boolean;
  setSendMax: (sendMax: boolean) => void;
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
  onNext,
  isLoading,
  dustFiltered,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });

  const handleNext = () => {
    // TODO: validate amount - get fee summary from enhanced txn and ensure amount is payable
    onNext();
  };

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
        Fee Rate
        <input type="text" value={feeRate} onChange={(e) => setFeeRate(e.target.value)} />
        {sendMax && dustFiltered && <Callout bodyText={t('BTC.MAX_IGNORING_DUST_UTXO_MSG')} />}
      </div>
      <Button title={t('NEXT')} onClick={handleNext} loading={isLoading} />
    </Container>
  );
}

export default AmountSelector;
