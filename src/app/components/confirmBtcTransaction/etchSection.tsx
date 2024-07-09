import useOrdinalsApi from '@hooks/apiClients/useOrdinalsApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { ArrowRight } from '@phosphor-icons/react';
import { EtchActionDetails, Inscription, RUNE_DISPLAY_DEFAULTS } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { ftDecimals, getShortTruncatedAddress } from '@utils/helper';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import Theme from '../../../theme';
import InscribeSection from './inscribeSection';
import {
  AddressLabel,
  Container,
  Header,
  RowCenter,
  RuneAmount,
  RuneData,
  RuneImage,
  RuneSymbol,
  RuneValue,
} from './runes';

type Props = {
  etch?: EtchActionDetails;
};

/**
 * only used for ordinals service etches
 */
function EtchSection({ etch }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { ordinalsAddress } = useSelectedAccount();
  const [delegateInscriptionDetails, setDelegateInscriptionDetails] = useState<Inscription | null>(
    null,
  );
  const ordinalsApi = useOrdinalsApi();

  const fetchInscriptionDetails = useCallback(async (inscriptionId: string) => {
    const inscriptionDetails = await ordinalsApi.getInscription(inscriptionId);
    if (inscriptionDetails) {
      setDelegateInscriptionDetails(inscriptionDetails);
    }
  }, []);

  useEffect(() => {
    if (etch?.delegateInscriptionId) {
      fetchInscriptionDetails(etch.delegateInscriptionId);
    }
  }, [fetchInscriptionDetails, etch?.delegateInscriptionId]);

  if (!etch) return null;

  return (
    <>
      <Container key={etch.runeName}>
        <Header>
          <StyledP typography="body_medium_m" color="white_200">
            {t('YOU_WILL_ISSUE')}
          </StyledP>
        </Header>
        <Header>
          <StyledP typography="body_medium_m" color="white_200">
            {t('NAME')}
          </StyledP>
          <StyledP typography="body_medium_m" color="white_0">
            {etch.runeName}
          </StyledP>
        </Header>
        <Header>
          <StyledP typography="body_medium_m" color="white_200">
            {t('SYMBOL')}
          </StyledP>
          <StyledP typography="body_medium_m" color="white_0">
            {etch.symbol ?? RUNE_DISPLAY_DEFAULTS.symbol}
          </StyledP>
        </Header>
        <Header>
          <StyledP typography="body_medium_m" color="white_200">
            {t('DIVISIBILITY')}
          </StyledP>
          <StyledP typography="body_medium_m" color="white_0">
            {etch.divisibility || RUNE_DISPLAY_DEFAULTS.divisibility}
          </StyledP>
        </Header>
        <Header>
          <StyledP typography="body_medium_m" color="white_200">
            {t('MINTABLE')}
          </StyledP>
          <StyledP typography="body_medium_m" color="white_0">
            {etch.isMintable ? t('YES') : t('NO')}
          </StyledP>
        </Header>
        <Header>
          <StyledP typography="body_medium_m" color="white_200">
            {t('MINT_AMOUNT')}
          </StyledP>
          <StyledP typography="body_medium_m" color="white_0">
            <NumericFormat
              value={ftDecimals(
                etch.terms?.amount || RUNE_DISPLAY_DEFAULTS.amount,
                etch.divisibility || RUNE_DISPLAY_DEFAULTS.divisibility,
              )}
              displayType="text"
              thousandSeparator
              renderText={(value: string) => (
                <StyledP typography="body_medium_m" color="white_0">
                  {value}
                </StyledP>
              )}
            />
          </StyledP>
        </Header>
        <Header>
          <StyledP typography="body_medium_m" color="white_200">
            {t('MINTING_LIMIT')}
          </StyledP>
          <NumericFormat
            value={ftDecimals(
              etch.terms?.cap || RUNE_DISPLAY_DEFAULTS.mintCap,
              etch.divisibility || RUNE_DISPLAY_DEFAULTS.divisibility,
            )}
            displayType="text"
            thousandSeparator
            renderText={(value: string) => (
              <StyledP typography="body_medium_m" color="white_0">
                {value}
              </StyledP>
            )}
          />
        </Header>
        {etch.terms?.heightStart ||
          (etch.terms?.heightEnd && (
            <Header>
              <StyledP typography="body_medium_m" color="white_200">
                {t('RUNE_BLOCK_HEIGHT_TERM')}
              </StyledP>
              <StyledP typography="body_medium_m" color="white_0">
                {`${etch.terms.heightStart}/${etch.terms.heightEnd}`}
              </StyledP>
            </Header>
          ))}
        {etch.terms?.offsetStart ||
          (etch.terms?.offsetEnd && (
            <Header>
              <StyledP typography="body_medium_m" color="white_200">
                {t('RUNE_BLOCK_OFFSET_TERM')}
              </StyledP>
              <StyledP typography="body_medium_m" color="white_0">
                {`${etch.terms.offsetStart ? etch.terms.offsetStart : '-'}/${etch.terms.offsetEnd}`}
              </StyledP>
            </Header>
          ))}
      </Container>
      {etch.premine && (
        <Container>
          <Header>
            <StyledP typography="body_medium_m" color="white_200">
              {t('YOU_WILL_RECEIVE')}
            </StyledP>
            <RowCenter>
              <ArrowRight weight="bold" color={Theme.colors.white_0} size={16} />
              <AddressLabel typography="body_medium_m">
                {' '}
                {etch.destinationAddress && etch.destinationAddress !== ordinalsAddress
                  ? getShortTruncatedAddress(etch.destinationAddress)
                  : t('YOUR_ORDINAL_ADDRESS')}
              </AddressLabel>
            </RowCenter>
          </Header>
          <Header>
            <StyledP typography="body_medium_m" color="white_0">
              {etch.runeName}
            </StyledP>
          </Header>
          <Header>
            <RuneData>
              <RuneImage>
                <StyledP typography="body_bold_l" color="white_0">
                  {etch.symbol || '¤'}
                </StyledP>
              </RuneImage>
              <RuneAmount>
                <StyledP typography="body_medium_m" color="white_0">
                  {t('AMOUNT')}
                </StyledP>
                {etch && (
                  <StyledP typography="body_medium_s" color="white_400">
                    {t('RUNE_SIZE')}: {RUNE_DISPLAY_DEFAULTS.size} Sats
                  </StyledP>
                )}
              </RuneAmount>
            </RuneData>
            <NumericFormat
              value={ftDecimals(
                etch.premine,
                etch.divisibility || RUNE_DISPLAY_DEFAULTS.divisibility,
              )}
              displayType="text"
              thousandSeparator
              renderText={(value: string) => (
                <RuneValue>
                  <StyledP typography="body_medium_m" color="white_0">
                    {value}
                  </StyledP>
                  <RuneSymbol typography="body_medium_m" color="white_0">
                    {etch?.symbol ?? '¤'}
                  </RuneSymbol>
                </RuneValue>
              )}
            />
          </Header>
        </Container>
      )}
      {etch.inscriptionDetails && (
        <InscribeSection
          content={etch.inscriptionDetails.contentBase64}
          contentType={etch.inscriptionDetails.contentType}
          payloadType="BASE_64"
          ordinalsAddress={etch.destinationAddress}
        />
      )}
      {etch.delegateInscriptionId && delegateInscriptionDetails && (
        <InscribeSection
          content={delegateInscriptionDetails.id}
          inscriptionId={delegateInscriptionDetails.id}
          contentType={delegateInscriptionDetails.mime_type}
          payloadType="BASE_64"
          ordinalsAddress={etch.destinationAddress}
        />
      )}
    </>
  );
}

export default EtchSection;
