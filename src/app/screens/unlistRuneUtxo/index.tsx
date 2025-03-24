import RequestsRoutes from '@common/utils/route-urls';
import TokenImage from '@components/tokenImage';
import TopRow from '@components/topRow';
import useXverseApi from '@hooks/apiClients/useXverseApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import PsbtConfirmation from '@screens/swap/components/psbtConfirmation/psbtConfirmation';
import type {
  ListedUtxoWithProvider,
  ListingWithListingProvider,
} from '@screens/unlistRune/unlistRuneItemPerMarketplace';
import { satsToBtc, type FungibleToken } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StyledHeading, StyledP } from '@ui-library/common.styled';
import Dialog from '@ui-library/dialog';
import { ftDecimals } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useLocation, useNavigate } from 'react-router-dom';

import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
  padding: 0 ${(props) => props.theme.space.m};
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Header = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.space.m,
}));

const InfoBox = styled.div<{ marginBottom: string; gap: string }>((props) => ({
  display: 'flex',
  flexDirection: 'column',
  wordBreak: 'break-all',
  marginBottom: props.marginBottom,
  gap: props.gap,
}));

const ListingsContainer = styled.div`
  display: flex;
  align-items: center;
  height: 76px;
  padding: 22px ${(props) => props.theme.space.m};
  border-radius: ${(props) => props.theme.space.xs};
  background-color: ${(props) => props.theme.colors.elevation1};
`;

const MarketplaceInfoContainer = styled.div`
  margin-left: 8px;
  margin-right: 12px;
  width: 174px;
  display: flex;
  gap: 2px;
  flex-direction: column;
`;

const StyledButton = styled(Button)`
  width: 100%;
  max-width: 79px;
`;

export default function UnlistRuneUtxoScreen() {
  useTrackMixPanelPageViewed();

  const { t } = useTranslation('translation', { keyPrefix: 'UNLIST_RUNE_SCREEN' });
  const navigate = useNavigate();
  const location = useLocation();
  const selectedAccount = useSelectedAccount();
  const xverseApi = useXverseApi();

  const [loading, setLoading] = useState(false);
  const [unisatDialogCallback, setUnisatDialogCallback] = useState<null | { cb: () => void }>(null);
  const [unisatCancellation, setUnisatCancellation] = useState<null | {
    psbt: string;
    orderId: string;
    listing: ListingWithListingProvider;
  }>(null);

  const { item, selectedRune } = location.state as {
    item: ListedUtxoWithProvider;
    selectedRune: FungibleToken;
  };
  const runeAmount = ftDecimals(String(item.runes?.[0][1].amount), selectedRune?.decimals ?? 0);
  const runeSymbol = item.runes?.[0][1].symbol ?? '';
  const runeLocation = `${item.txid}:${item.vout}`;

  const handleUnlist = async (listing: ListingWithListingProvider) => {
    if (!selectedAccount) {
      return;
    }

    try {
      setLoading(true);
      const response = await xverseApi.listings.getRuneCancelOrder({
        orderIdsPerMarketplace: [
          { orderId: listing.orderId, marketplace: listing.marketplaceName },
        ],
        btcPublicKey: selectedAccount?.btcPublicKey,
        ordinalsAddress: selectedAccount?.ordinalsAddress,
        ordinalsPublicKey: selectedAccount?.ordinalsPublicKey,
      });
      const data = response[0];

      if (['Magic Eden', 'OKX'].includes(listing.marketplaceName) && data.type === 'withMessage') {
        navigate(RequestsRoutes.SignRuneDelistingMessage, {
          state: {
            requestPayload: {
              payload: {
                token: data.token,
                message: data.message,
                address: selectedAccount?.ordinalsAddress,
                selectedRuneId: selectedRune.principal,
                orderIds: [listing.orderId],
                marketplace: listing.marketplaceName,
              },
            },
          },
        });
      } else if (listing.marketplaceName === 'Unisat' && data.type === 'withPsbt') {
        setUnisatCancellation({ psbt: data.psbt, orderId: data.orderId, listing });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (unisatCancellation) {
    return (
      <PsbtConfirmation
        orderInfo={{
          providerCode: 'Unisat',
          order: {
            psbt: unisatCancellation.psbt,
            orderId: unisatCancellation.orderId,
            expiresInMilliseconds: null,
          },
        }}
        onConfirm={() => {}}
        onClose={() => setUnisatCancellation(null)}
        customCallout={{
          bodyText: t('UNISAT_DIALOG.CALLOUT'),
        }}
        customExecute={async (signedPsbt) => {
          const response = await xverseApi.listings.submitRuneCancelOrder({
            cancellationsPerMarketplace: [
              {
                marketplace: unisatCancellation.listing.marketplaceName,
                orderId: unisatCancellation.listing.orderId,
                type: 'withPsbt',
                psbt: signedPsbt,
              },
            ],
          });

          navigate('/tx-status', {
            state: {
              txid: response[0].txid,
              currency: 'BTC',
              error: '',
              browserTx: false,
            },
          });
        }}
      />
    );
  }

  if (unisatDialogCallback) {
    return (
      <Dialog
        visible={!!unisatDialogCallback}
        title={t('UNISAT_DIALOG.TITLE')}
        description={t('UNISAT_DIALOG.DESCRIPTION')}
        rightButtonText={t('UNISAT_DIALOG.CONTINUE')}
        onRightButtonClick={unisatDialogCallback.cb}
        rightButtonDisabled={loading}
        leftButtonText={t('UNISAT_DIALOG.BACK')}
        onLeftButtonClick={() => setUnisatDialogCallback(null)}
        leftButtonDisabled={loading}
        onClose={() => setUnisatDialogCallback(null)}
        type="default"
      />
    );
  }

  return (
    <>
      <TopRow onClick={() => navigate(-1)} />
      <Container>
        <Header>{t('LISTING')}</Header>
        <InfoBox gap="2px" marginBottom="22px">
          <StyledHeading color="white_400" typography="body_medium_m">
            {t('AMOUNT')}
          </StyledHeading>
          <NumericFormat
            value={runeAmount}
            displayType="text"
            suffix={` ${runeSymbol}`}
            thousandSeparator
            decimalScale={2}
            renderText={(value: string) => (
              <StyledP color="white_0" typography="body_medium_m">
                {value}
              </StyledP>
            )}
          />
        </InfoBox>
        <InfoBox gap="2px" marginBottom="24px">
          <StyledHeading color="white_400" typography="body_medium_m">
            {t('BUNDLE')}
          </StyledHeading>
          <StyledP color="white_0" typography="body_medium_m">
            {runeLocation}
          </StyledP>
        </InfoBox>
        <InfoBox gap="12px" marginBottom="22px">
          <StyledHeading color="white_400" typography="body_medium_m">
            {t('LISTED_ON')}
          </StyledHeading>
          {item.listings.map((listing) => (
            <ListingsContainer key={listing.marketplaceName}>
              <TokenImage
                key={listing.marketplaceName}
                fungibleToken={{ image: listing.marketplace.logo } as FungibleToken}
                size={32}
              />
              <MarketplaceInfoContainer>
                <StyledP color="white_0" typography="body_bold_m">
                  {listing.marketplaceName}
                </StyledP>
                <StyledHeading color="white_400" typography="body_medium_m">
                  {satsToBtc(BigNumber(listing.totalPriceSats)).toNumber()} BTC
                </StyledHeading>
              </MarketplaceInfoContainer>
              <StyledButton
                title={t('DELIST')}
                variant="secondary"
                loading={loading}
                onClick={() => {
                  if (listing.marketplaceName === 'Unisat') {
                    setUnisatDialogCallback({ cb: handleUnlist.bind({}, listing) });
                  } else {
                    handleUnlist(listing);
                  }
                }}
              />
            </ListingsContainer>
          ))}
        </InfoBox>
      </Container>
    </>
  );
}
