import useSelectedAccount from '@hooks/useSelectedAccount';
import { ArrowRight } from '@phosphor-icons/react';
import type { MintActionDetails, RuneMint } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { ftDecimals, getShortTruncatedAddress } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import Theme from '../../../../../theme';
import { useTxSummaryContext } from '../../hooks/useTxSummaryContext';
import {
  AddressLabel,
  Container,
  Header,
  Pill,
  RowCenter,
  RuneAmount,
  RuneData,
  RuneImage,
  RuneSymbol,
  RuneValue,
  StyledPillLabel,
} from './styles';

function MintSection() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { ordinalsAddress } = useSelectedAccount();

  const { extractedTxSummary, runeMintDetails, batchMintDetails } = useTxSummaryContext();

  if (!extractedTxSummary.runes.mint || !runeMintDetails || !batchMintDetails) return null;

  const isMintActionDetails = (
    obj: RuneMint | MintActionDetails | undefined,
  ): obj is MintActionDetails => obj !== undefined && 'repeats' in obj;

  return (
    <>
      {[extractedTxSummary.runes.mint, runeMintDetails, ...batchMintDetails].map(
        (mint: RuneMint | MintActionDetails | undefined) =>
          mint && (
            <Container key={mint.runeName}>
              <Header>
                <StyledPillLabel>
                  {t('YOU_WILL_MINT')}
                  {isMintActionDetails(mint) && mint.repeats && <Pill>{`x${mint.repeats}`}</Pill>}
                </StyledPillLabel>
                <RowCenter>
                  <ArrowRight weight="bold" color={Theme.colors.white_0} size={16} />
                  <AddressLabel typography="body_medium_m">
                    {isMintActionDetails(mint) &&
                    mint.destinationAddress &&
                    mint.destinationAddress !== ordinalsAddress
                      ? getShortTruncatedAddress(mint.destinationAddress)
                      : t('YOUR_ORDINAL_ADDRESS')}
                  </AddressLabel>
                </RowCenter>
              </Header>
              <Header>
                <StyledP typography="body_medium_m" color="white_0">
                  {mint.runeName}
                </StyledP>
              </Header>
              <Header>
                <RuneData>
                  <RuneImage>
                    <StyledP typography="body_bold_l" color="white_0">
                      {mint.symbol}
                    </StyledP>
                  </RuneImage>
                  <RuneAmount>
                    <StyledP typography="body_medium_m" color="white_0">
                      {t('AMOUNT')}
                    </StyledP>
                    {isMintActionDetails(mint) && mint.runeSize && (
                      <StyledP typography="body_medium_s" color="white_400">
                        {t('RUNE_SIZE')}: {mint.runeSize} Sats
                      </StyledP>
                    )}
                  </RuneAmount>
                </RuneData>
                <RuneValue>
                  <NumericFormat
                    value={ftDecimals(mint.amount.toString(10) ?? 0, mint.divisibility ?? 0)}
                    displayType="text"
                    thousandSeparator
                    renderText={(value: string) => (
                      <StyledP typography="body_medium_m" color="white_0">
                        {value}
                      </StyledP>
                    )}
                  />
                  <RuneSymbol typography="body_medium_m" color="white_0">
                    {mint.symbol}
                  </RuneSymbol>
                </RuneValue>
              </Header>
            </Container>
          ),
      )}
    </>
  );
}

export default MintSection;
