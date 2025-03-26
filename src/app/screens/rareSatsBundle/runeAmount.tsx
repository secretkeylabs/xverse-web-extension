import { RightAlignedStyledFiatAmountText } from '@components/fiatAmountText';
import TokenImage from '@components/tokenImage';
import useRuneFiatRateQuery from '@hooks/queries/runes/useRuneFiatRateQuery';
import useWalletSelector from '@hooks/useWalletSelector';
import type { RuneBase } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { ftDecimals } from '@utils/helper';
import { mapRuneBaseToFungibleToken } from '@utils/mappers';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div<{ $topMargin?: boolean }>((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: props.theme.space.s,
  marginTop: props.$topMargin ? props.theme.space.s : 0,
  backgroundColor: props.theme.colors.elevation1,
  padding: props.theme.space.m,
  borderRadius: props.theme.space.xs,
}));

const AvatarContainer = styled.div`
  margin-right: ${(props) => props.theme.space.m};
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 24px;
`;

const Column = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
`;

type Props = {
  rune: RuneBase;
  hasSufficientBalance?: boolean;
  topMargin?: boolean;
};

export default function RuneAmount({
  rune,
  hasSufficientBalance = true,
  topMargin = false,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { runeName, amount, divisibility, symbol } = rune;
  const amountWithDecimals = ftDecimals(String(amount), divisibility);
  const { fiatCurrency } = useWalletSelector();
  const { data: runeFiatRate } = useRuneFiatRateQuery(rune.runeId);
  return (
    <Container $topMargin={topMargin}>
      <AvatarContainer>
        <TokenImage
          currency="FT"
          fungibleToken={mapRuneBaseToFungibleToken(rune)}
          showProtocolIcon
          loading={false}
          size={32}
        />
      </AvatarContainer>
      <Column>
        <Row>
          <StyledP typography="body_medium_m" color="white_0">
            {t('AMOUNT')}
          </StyledP>
          <NumericFormat
            value={amountWithDecimals}
            displayType="text"
            thousandSeparator
            suffix={` ${symbol}`}
            renderText={(value: string) => (
              <StyledP
                data-testid="send-rune-amount"
                typography="body_medium_m"
                color={hasSufficientBalance ? 'white_0' : 'danger_light'}
              >
                {value}
              </StyledP>
            )}
          />
        </Row>
        <Row>
          <StyledP data-testid="rune-name" typography="body_medium_s" color="white_400">
            {runeName}
          </StyledP>
          {runeFiatRate !== undefined && runeFiatRate > 0 && (
            <RightAlignedStyledFiatAmountText
              fiatAmount={BigNumber(amountWithDecimals).multipliedBy(runeFiatRate)}
              fiatCurrency={fiatCurrency}
            />
          )}
        </Row>
      </Column>
    </Container>
  );
}
