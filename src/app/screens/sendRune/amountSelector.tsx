import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useBtcAddressBalance from '@hooks/useBtcAddressBalance';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import RuneAmountSelector from '@screens/sendRune/runeAmountSelector';
import { getBtcFiatEquivalent, type FungibleToken } from '@secretkeylabs/xverse-core';
import SelectFeeRate from '@ui-components/selectFeeRate';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import { getFtBalance } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const FeeRateContainer = styled.div`
  margin-top: ${(props) => props.theme.spacing(12)}px;
  margin-bottom: ${(props) => props.theme.spacing(8)}px;
`;

const Buttons = styled.div`
  margin: ${(props) => props.theme.spacing(12)}px 0;
`;

type Props = {
  token: FungibleToken;
  amountToSend: string;
  setAmountToSend: (amount: string) => void;
  useTokenValue: boolean;
  setUseTokenValue: (toggle: boolean) => void;
  amountError: string;
  feeRate: string;
  setFeeRate: (feeRate: string) => void;
  sendMax: boolean;
  setSendMax: (sendMax: boolean) => void;
  fee: string | undefined;
  getFeeForFeeRate: (feeRate: number, useEffectiveFeeRate?: boolean) => Promise<number | undefined>;
  onNext: () => void;
  dustFiltered: boolean;
  hasSufficientFunds: boolean;
  isLoading?: boolean;
  header?: React.ReactNode;
};

function AmountSelector({
  token,
  amountToSend,
  setAmountToSend,
  useTokenValue,
  setUseTokenValue,
  amountError,
  feeRate,
  setFeeRate,
  sendMax,
  setSendMax,
  fee,
  getFeeForFeeRate,
  onNext,
  isLoading,
  dustFiltered,
  hasSufficientFunds,
  header,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { t: tUnits } = useTranslation('translation', { keyPrefix: 'UNITS' });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const { fiatCurrency } = useWalletSelector();
  const { btcFiatRate } = useSupportedCoinRates();
  const { data: recommendedFees } = useBtcFeeRate();
  const { btcAddress } = useSelectedAccount();
  const { data: btcBalance, isLoading: btcBalanceLoading } = useBtcAddressBalance(btcAddress);
  const navigate = useNavigate();

  const balance = getFtBalance(token);

  const satsToFiat = (sats: string) =>
    getBtcFiatEquivalent(new BigNumber(sats), BigNumber(btcFiatRate)).toString();

  const amountIsPositiveNumber =
    amountToSend !== '' && !Number.isNaN(Number(amountToSend)) && +amountToSend > 0;

  const isSendButtonEnabled = amountIsPositiveNumber && +amountToSend <= +balance;

  const hasBtc = (btcBalance?.confirmedBalance ?? 0) > 0;
  const canSwapFromBtc = hasBtc && !btcBalanceLoading;

  const hasRune = +balance > 0;

  return (
    <Container>
      <div>
        {header}
        <RuneAmountSelector
          token={token}
          amountToSend={amountToSend}
          setAmountToSend={setAmountToSend}
          useTokenValue={useTokenValue}
          setUseTokenValue={setUseTokenValue}
          amountError={amountError}
          sendMax={sendMax}
          setSendMax={setSendMax}
        />
        <FeeRateContainer>
          <SelectFeeRate
            fee={fee}
            feeUnits="sats"
            feeRate={feeRate}
            feeRateUnits={tUnits('SATS_PER_VB')}
            setFeeRate={setFeeRate}
            baseToFiat={satsToFiat}
            fiatUnit={fiatCurrency}
            getFeeForFeeRate={getFeeForFeeRate}
            feeRates={{
              medium: recommendedFees?.regular,
              high: recommendedFees?.priority,
            }}
            feeRateLimits={recommendedFees?.limits}
            isLoading={isLoading}
          />
        </FeeRateContainer>
        {sendMax && dustFiltered && <Callout bodyText={t('BTC.MAX_IGNORING_DUST_UTXO_MSG')} />}
      </div>
      <Buttons>
        {hasRune ? (
          <Button
            title={
              !hasSufficientFunds && amountIsPositiveNumber ? t('INSUFFICIENT_FUNDS') : t('NEXT')
            }
            onClick={onNext}
            loading={isLoading}
            disabled={!hasSufficientFunds || !isSendButtonEnabled}
            variant={!hasSufficientFunds && amountIsPositiveNumber ? 'danger' : undefined}
          />
        ) : (
          canSwapFromBtc && (
            <Callout
              dataTestID="no-funds-message"
              titleText={t('BTC.NO_FUNDS_TITLE')}
              bodyText={t('EMPTY_RUNE_BALANCE', {
                symbol: token.runeSymbol,
              })}
              redirectText={t('SWAP_FROM_TO', {
                from: tCommon('BTC'),
                to: token.runeSymbol,
              })}
              onClickRedirect={() => {
                navigate(`/swap?from=BTC&to=${token.principal}`);
              }}
            />
          )
        )}
      </Buttons>
    </Container>
  );
}

export default AmountSelector;
