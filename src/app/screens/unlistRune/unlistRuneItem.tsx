import RequestsRoutes from '@common/utils/route-urls';
import useRunesApi from '@hooks/apiClients/useRunesApi';
import useCoinRates from '@hooks/queries/useCoinRates';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { getBtcFiatEquivalent, satsToBtc } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import { getTruncatedAddress } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  padding: ${(props) => props.theme.space.s};
  border-radius: ${(props) => props.theme.space.xs};
  background-color: ${(props) => props.theme.colors.elevation1};
  justify-content: space-between;
`;

const Wrapper = styled.div`
  display: flex;
  gap: ${(props) => props.theme.space.m};
  width: 100%;
`;

const ListingDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  gap: ${(props) => props.theme.space.xxxs};
`;

const TxIdText = styled.span((props) => ({
  ...props.theme.typography.body_medium_s,
  color: props.theme.colors.white_400,
}));

const SubContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const RuneTitle = styled(StyledP)`
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const StyledBundleSub = styled(StyledP)`
  text-align: right;
  width: 100%;
`;

const StyledButton = styled(Button)`
  width: 100%;
  max-width: 79px;
`;

type Props = {
  runeAmount: string;
  runeSymbol: string;
  txId: string;
  vout: string;
  listPrice: BigNumber;
  orderIds: string[];
  selectedRuneId: string;
};

function UnlistRuneItem({
  runeAmount,
  runeSymbol,
  txId,
  vout,
  listPrice,
  orderIds,
  selectedRuneId,
}: Props) {
  const { btcFiatRate } = useCoinRates();
  const selectedAccount = useSelectedAccount();
  const { fiatCurrency } = useWalletSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const runesApi = useRunesApi();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const satsToFiat = (sats: string) =>
    getBtcFiatEquivalent(new BigNumber(sats), new BigNumber(btcFiatRate)).toNumber().toFixed(2);

  const handleUnlist = async () => {
    if (!selectedAccount) {
      return;
    }

    try {
      setIsLoading(true);
      const { token, message } = await runesApi.cancelRunesSellOrder({
        orderIds,
        makerPublicKey: selectedAccount?.ordinalsPublicKey,
        makerAddress: selectedAccount?.ordinalsAddress,
      });

      navigate(RequestsRoutes.SignMessageRequestInApp, {
        state: {
          requestPayload: {
            payload: {
              token,
              orderIds,
              message,
              address: selectedAccount?.ordinalsAddress,
              selectedRuneId,
            },
          },
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container data-testid="listed-rune-container">
      <Wrapper>
        <ListingDetailContainer>
          <SubContainer>
            <div>
              <NumericFormat
                value={runeAmount}
                displayType="text"
                suffix={` ${runeSymbol}`}
                thousandSeparator
                decimalScale={2}
                renderText={(value: string) => (
                  <RuneTitle typography="body_medium_m" color="white_0">
                    {value}
                  </RuneTitle>
                )}
              />
            </div>
            <div>
              <NumericFormat
                value={satsToBtc(listPrice).toNumber()}
                displayType="text"
                suffix={` BTC`}
                decimalScale={5}
                renderText={(value: string) => (
                  <StyledP data-testid="listed-price" typography="body_medium_m" color="white_0">
                    {value}
                  </StyledP>
                )}
              />
            </div>
          </SubContainer>
          <SubContainer>
            <TxIdText>{`${getTruncatedAddress(txId, 6)}:${vout}`}</TxIdText>
            <NumericFormat
              value={satsToFiat(String(listPrice))}
              displayType="text"
              prefix="~ $"
              suffix={` ${fiatCurrency}`}
              thousandSeparator
              renderText={(value: string) => (
                <StyledBundleSub typography="body_medium_s" color="white_200">
                  {value}
                </StyledBundleSub>
              )}
            />
          </SubContainer>
        </ListingDetailContainer>
        <StyledButton
          title={t('CANCEL')}
          variant="secondary"
          onClick={handleUnlist}
          loading={isLoading}
        />
      </Wrapper>
    </Container>
  );
}

export default UnlistRuneItem;
