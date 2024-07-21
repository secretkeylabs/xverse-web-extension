import { mapRuneNameToPlaceholder } from '@components/confirmBtcTransaction/utils';
import TokenImage from '@components/tokenImage';
import type { RuneBase } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { ftDecimals } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: 'center';
`;

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

const StyledPRight = styled(StyledP)`
  word-break: break-all;
  text-align: end;
`;

type Props = {
  rune: RuneBase;
  hasSufficientBalance?: boolean;
};

export default function RuneAmount({ rune, hasSufficientBalance = true }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { runeName, amount, divisibility, symbol, inscriptionId } = rune;
  const amountWithDecimals = ftDecimals(String(amount), divisibility);
  return (
    <Container>
      <AvatarContainer>
        <TokenImage
          currency="FT"
          fungibleToken={mapRuneNameToPlaceholder(runeName, symbol, inscriptionId)}
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
              <StyledPRight
                data-testid="send-rune-amount"
                typography="body_medium_m"
                color={hasSufficientBalance ? 'white_0' : 'danger_light'}
              >
                {value}
              </StyledPRight>
            )}
          />
        </Row>
        <StyledP typography="body_medium_s" color="white_400">
          {runeName}
        </StyledP>
      </Column>
    </Container>
  );
}
