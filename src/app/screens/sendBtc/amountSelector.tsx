import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useAddressBookEntries from '@hooks/useAddressBookEntries';
import useBtcAddressBalance from '@hooks/useBtcAddressBalance';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useGetAllAccounts from '@hooks/useGetAllAccounts';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  AnalyticsEvents,
  getBtcFiatEquivalent,
  type BtcPaymentType,
} from '@secretkeylabs/xverse-core';
import BtcAmountSelector from '@ui-components/btcAmountSelector';
import SelectFeeRate from '@ui-components/selectFeeRate';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import { StyledP } from '@ui-library/common.styled';
import { FullWidthDivider } from '@ui-library/divider';
import { getRecipientName, getTruncatedAddress } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1 1 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ContentWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const FeeRateContainer = styled.div`
  margin-top: ${(props) => props.theme.space.l};
  margin-bottom: ${(props) => props.theme.space.m};
`;

const Buttons = styled.div`
  margin: ${(props) => props.theme.space.l} 0;
`;

const RecipientAccountName = styled.span`
  color: ${(props) => props.theme.colors.white_0};
`;

type Props = {
  recipientAddress: string;
  amountSats: string;
  overridePaymentType: BtcPaymentType;
  setAmountSats: (amount: string) => void;
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
};

function AmountSelector({
  recipientAddress,
  amountSats,
  overridePaymentType,
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
  hasSufficientFunds,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { t: tUnits } = useTranslation('translation', { keyPrefix: 'UNITS' });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const navigate = useNavigate();

  const { fiatCurrency } = useWalletSelector();
  const selectedAccount = useSelectedAccount(overridePaymentType);
  const allAccounts = useGetAllAccounts();
  const { data: btcBalance, isLoading: btcBalanceLoading } = useBtcAddressBalance(
    selectedAccount.btcAddress,
  );
  const { btcFiatRate } = useSupportedCoinRates();
  const { entries: addressBook } = useAddressBookEntries();

  const { data: recommendedFees } = useBtcFeeRate();

  const satsToFiat = (sats: string) =>
    getBtcFiatEquivalent(new BigNumber(sats), BigNumber(btcFiatRate)).toString();

  if (btcBalanceLoading || btcBalance === undefined) {
    return null;
  }

  const recipientName = getRecipientName(recipientAddress, allAccounts, addressBook, tCommon);
  const hasBtc = (btcBalance?.confirmedBalance ?? 0) > 0;

  return (
    <Container>
      <ContentWrapper>
        <div>
          <StyledP typography="body_medium_m" color="white_400">
            {tCommon('TO')}: <RecipientAccountName>{recipientName}</RecipientAccountName>{' '}
            {getTruncatedAddress(recipientAddress, 6)}
          </StyledP>
          <FullWidthDivider $verticalMargin="m" />
          <BtcAmountSelector
            data-testid="test-container"
            amountSats={amountSats}
            setAmountSats={setAmountSats}
            sendMax={sendMax}
            setSendMax={setSendMax}
            overridePaymentType={overridePaymentType}
            disabled={!hasBtc}
          />
        </div>
        {hasBtc && (
          <div>
            <FullWidthDivider $verticalMargin="m" />
            <FeeRateContainer data-testid="feerate-container">
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
          </div>
        )}
        {sendMax && dustFiltered && <Callout bodyText={t('BTC.MAX_IGNORING_DUST_UTXO_MSG')} />}
      </ContentWrapper>
      <Buttons>
        {hasBtc && (
          <Button
            title={hasSufficientFunds ? t('NEXT') : t('INSUFFICIENT_FUNDS')}
            onClick={onNext}
            loading={isLoading}
            disabled={!hasSufficientFunds || +amountSats === 0}
            variant={hasSufficientFunds ? undefined : 'danger'}
          />
        )}
        {!hasBtc && (
          <Callout
            dataTestID="no-funds-message"
            titleText={t('BTC.NO_FUNDS_TITLE')}
            bodyText={t('BTC.NO_FUNDS')}
            redirectText={t('BTC.BUY_BTC')}
            onClickRedirect={() => {
              trackMixPanel(AnalyticsEvents.InitiateBuyFlow, {
                selectedToken: 'BTC',
                source: 'send_btc',
              });
              navigate('/buy/BTC');
            }}
          />
        )}
      </Buttons>
    </Container>
  );
}

export default AmountSelector;
