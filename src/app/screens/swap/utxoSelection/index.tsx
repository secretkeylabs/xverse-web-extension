import TopRow from '@components/topRow';
import { ArrowClockwise, ArrowRight } from '@phosphor-icons/react';
import {
  currencySymbolMap,
  getBtcFiatEquivalent,
  satsToBtc,
  type GetUtxosRequest,
  type MarketUtxo,
  type Token,
  type UtxoQuote,
} from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';

import useGetUtxos from '@hooks/queries/swaps/useGetUtxos';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useCoinRates from '@hooks/queries/useCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import Button from '@ui-library/button';
import SnackBar from '@ui-library/snackBar';
import Spinner from '@ui-library/spinner';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import Theme from 'theme';
import QuoteSummaryTile from '../quoteSummary/quoteSummaryTile';
import UtxoItem from './utxoItem';

const Heading = styled(StyledP)`
  margin-bottom: ${(props) => props.theme.space.xxs};
  font-style: normal;
  font-weight: 700;
  line-height: 140%;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${(props) => props.theme.space.m};
  margin-right: ${(props) => props.theme.space.m};
`;

const RefreshView = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  margin-top: ${(props) => props.theme.space.m};
`;
const ButtonImage = styled.button`
  background-color: transparent;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.s};
  margin-top: ${(props) => props.theme.space.m};
  padding-bottom: ${(props) => props.theme.space.s};
`;

const StickyButtonContainer = styled.div`
  position: sticky;
  bottom: 0;
  padding-bottom: ${(props) => props.theme.space.l};
  padding-top: ${(props) => props.theme.space.s};
  background-color: ${(props) => props.theme.colors.elevation0};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: ${(props) => props.theme.space.s};
`;

const TextsColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  flex: 1;
`;

const Arrow = styled.div`
  flex-direction: column;
  justify-content: center;
  align-self: center;
  align-items: 'flex-start';
  padding: 0 ${(props) => props.theme.space.m};
`;

const BtnView = styled.div`
  margin-top: ${(props) => props.theme.space.m};
`;

const LoaderContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-top: ${(props) => props.theme.space.l};
`;

type Props = {
  utxosRequest: GetUtxosRequest;
  selectedUtxoProvider?: UtxoQuote;
  toToken?: Token;
  onClose: () => void;
  onChangeProvider: () => void;
  onNext: (amount: string, btcAmount: string, selectedUtxos: Omit<MarketUtxo, 'token'>[]) => void;
};

export default function UtxoSelection({
  utxosRequest,
  toToken,
  selectedUtxoProvider,
  onClose,
  onChangeProvider,
  onNext,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'COMMON' });

  const { fiatCurrency } = useWalletSelector();
  const { btcFiatRate } = useCoinRates();
  const { data: btcBalance } = useBtcWalletData();

  const totalRunesPerBtc = new BigNumber(100000000).dividedBy(
    new BigNumber(selectedUtxoProvider?.floorRate ?? 1),
  );
  const [selectedUtxos, setSelectedUtxos] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    data: utxosData,
    isLoading: utxosLoading,
    error: utxosError,
    refetch: refetchUtxos,
    isRefetching,
  } = useGetUtxos(utxosRequest);

  const utxos = useMemo(() => utxosData?.items ?? [], [utxosData]);

  useEffect(() => {
    if (errorMessage || utxosError) {
      const toastId = toast.custom(
        <SnackBar
          text={errorMessage ?? utxosError?.message}
          type="error"
          actionButtonCallback={() => {
            toast.remove(toastId);
          }}
        />,
        { duration: 3000 },
      );
    }
  }, [errorMessage, utxosError]);

  useEffect(() => {
    if (!isRefetching && !utxosLoading && utxos) {
      const missingUtxos = Array.from(selectedUtxos).filter(
        (id) => !utxos.some((utxo) => utxo.identifier === id),
      );
      if (missingUtxos.length > 0) {
        if (missingUtxos.length === selectedUtxos.size) {
          setErrorMessage(t('ERRORS.MISSING_UTXOS'));
        } else {
          setErrorMessage(t('ERRORS.SOME_MISSING_UTXOS'));
        }
      } else {
        setErrorMessage('');
      }
    }
  }, [utxos, isRefetching, utxosLoading, selectedUtxos]);

  const handleSelect = (utxo: MarketUtxo) => {
    setSelectedUtxos((prev) => {
      const id = utxo.identifier;
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  const totalRuneAmount = Array.from(selectedUtxos).reduce((acc, id) => {
    const utxo = utxos.find((u) => u.identifier === id);
    if (utxo) {
      return acc.plus(utxo.amount);
    }
    return acc;
  }, new BigNumber(0));

  const totalSatsAmount = Array.from(selectedUtxos).reduce((acc, id) => {
    const utxo = utxos.find((u) => u.identifier === id);
    if (utxo) {
      return acc.plus(utxo.price);
    }
    return acc;
  }, new BigNumber(0));

  const insufficientBalance = btcBalance && totalSatsAmount.gte(new BigNumber(btcBalance));

  return (
    <>
      <TopRow onClick={onClose} />
      <StyledContainer>
        <Heading typography="headline_s" color="white_0">
          {t('SWAP_BTC')}
        </Heading>
        <QuoteSummaryTile
          fromUnit="BTC"
          toUnit={toToken?.symbol}
          rate={totalRunesPerBtc.toString()}
          provider={selectedUtxoProvider?.provider.name || ''}
          image={selectedUtxoProvider?.provider.logo || ''}
          onClick={onChangeProvider}
        />
        <RefreshView>
          <StyledP typography="body_medium_m" color="white_200">
            {t('SELECT_BUNDLES')}
          </StyledP>
          <ButtonImage onClick={() => refetchUtxos()}>
            <ArrowClockwise color={Theme.colors.white_400} size="20" />
          </ButtonImage>
        </RefreshView>
        {utxosLoading || isRefetching ? (
          <LoaderContainer>
            <Spinner size={20} />
          </LoaderContainer>
        ) : (
          <ListContainer>
            {utxos.map((utxo) => (
              <UtxoItem
                key={utxo.identifier}
                utxo={utxo}
                selected={selectedUtxos.has(utxo.identifier)}
                token={toToken}
                onSelect={handleSelect}
              />
            ))}
          </ListContainer>
        )}

        {selectedUtxos.size > 0 && (
          <StickyButtonContainer>
            <Row>
              <TextsColumn>
                <StyledP typography="body_medium_s" color="white_200">
                  {t('FROM')}
                </StyledP>
                <NumericFormat
                  value={satsToBtc(new BigNumber(totalSatsAmount)).toString()}
                  displayType="text"
                  suffix=" BTC"
                  thousandSeparator
                  renderText={(value: string) => (
                    <StyledP typography="body_medium_m" color="white_0">
                      {value}
                    </StyledP>
                  )}
                />
                <NumericFormat
                  value={getBtcFiatEquivalent(
                    new BigNumber(new BigNumber(totalSatsAmount)),
                    new BigNumber(btcFiatRate),
                  ).toFixed(2)}
                  displayType="text"
                  prefix={`~ ${currencySymbolMap[fiatCurrency]}`}
                  suffix={` ${fiatCurrency}`}
                  thousandSeparator
                  renderText={(value: string) => (
                    <StyledP typography="body_medium_m" color="white_0">
                      {value}
                    </StyledP>
                  )}
                />
              </TextsColumn>
              <Arrow>
                <ArrowRight size={16} color={Theme.colors.white_200} />
              </Arrow>
              <TextsColumn>
                <StyledP typography="body_medium_s" color="white_200">
                  {t('TO')}
                </StyledP>
                <NumericFormat
                  value={totalRuneAmount.toString()}
                  displayType="text"
                  suffix={` ${toToken?.symbol}`}
                  thousandSeparator
                  renderText={(value: string) => (
                    <StyledP typography="body_medium_m" color="white_0">
                      {value}
                    </StyledP>
                  )}
                />
              </TextsColumn>
            </Row>
            <BtnView>
              <Button
                title={
                  insufficientBalance ? t('ERRORS.INSUFFICIENT_BALANCE_FEES') : commonT('NEXT')
                }
                onClick={() => {
                  const selectedBundles: Omit<MarketUtxo, 'token'>[] = Array.from(selectedUtxos)
                    .map((id) => {
                      const utxo = utxos.find((u) => u.identifier === id);
                      if (utxo) {
                        return {
                          identifier: utxo.identifier,
                          amount: utxo.amount,
                          price: utxo.price,
                        };
                      }
                      return null;
                    })
                    .filter((bundle): bundle is Omit<MarketUtxo, 'token'> => bundle !== null);
                  onNext(totalRuneAmount.toString(), totalSatsAmount.toString(), selectedBundles);
                }}
                disabled={Boolean(insufficientBalance)}
                variant={insufficientBalance ? 'danger' : 'primary'}
              />
            </BtnView>
          </StickyButtonContainer>
        )}
      </StyledContainer>
    </>
  );
}
