import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useAddressBookEntries from '@hooks/useAddressBookEntries';
import useBtcAddressBalance from '@hooks/useBtcAddressBalance';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useGetAllAccounts from '@hooks/useGetAllAccounts';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import RuneAmountSelector from '@screens/sendRune/runeAmountSelector';
import { getBtcFiatEquivalent, type FungibleToken } from '@secretkeylabs/xverse-core';
import SelectFeeRate from '@ui-components/selectFeeRate';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import { StyledP } from '@ui-library/common.styled';
import { FullWidthDivider } from '@ui-library/divider';
import { getRecipientName, getTruncatedAddress } from '@utils/helper';
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
  token: FungibleToken;
  amountToSend: string;
  setAmountToSend: (amount: string) => void;
  useTokenValue: boolean;
  setUseTokenValue: (toggle: boolean) => void;
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
  recipientAddress: string;
};

function AmountSelector({
  token,
  amountToSend,
  setAmountToSend,
  useTokenValue,
  setUseTokenValue,
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
  recipientAddress,
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
  const allAccounts = useGetAllAccounts();
  const { entries: addressBook } = useAddressBookEntries();

  const balance = getFtBalance(token);

  const satsToFiat = (sats: string) =>
    getBtcFiatEquivalent(new BigNumber(sats), BigNumber(btcFiatRate)).toString();

  const amountIsPositiveNumber =
    amountToSend !== '' && !Number.isNaN(Number(amountToSend)) && +amountToSend > 0;

  const isSendButtonEnabled = amountIsPositiveNumber && +amountToSend <= +balance;

  const hasBtc = (btcBalance?.confirmedBalance ?? 0) > 0;
  const canSwapFromBtc = hasBtc && !btcBalanceLoading;

  const recipientName = getRecipientName(recipientAddress, allAccounts, addressBook, tCommon);
  const hasRune = +balance > 0;

  return (
    <Container>
      <ContentWrapper>
        <div>
          <StyledP typography="body_medium_m" color="white_400">
            {tCommon('TO')}: <RecipientAccountName>{recipientName}</RecipientAccountName>{' '}
            {getTruncatedAddress(recipientAddress, 6)}
          </StyledP>
          <FullWidthDivider $verticalMargin="m" />
          <RuneAmountSelector
            token={token}
            amountToSend={amountToSend}
            setAmountToSend={setAmountToSend}
            useTokenValue={useTokenValue}
            setUseTokenValue={setUseTokenValue}
            sendMax={sendMax}
            setSendMax={setSendMax}
          />
        </div>
        {hasRune && (
          <div>
            <FullWidthDivider $verticalMargin="m" />
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
          </div>
        )}
        {sendMax && dustFiltered && <Callout bodyText={t('BTC.MAX_IGNORING_DUST_UTXO_MSG')} />}
      </ContentWrapper>
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
