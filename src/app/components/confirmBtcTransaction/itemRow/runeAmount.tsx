import { mapRuneNameToPlaceholder } from '@components/confirmBtcTransaction/utils';
import TokenImage from '@components/tokenImage';
import { RuneBase } from '@secretkeylabs/xverse-core';
import Avatar from '@ui-library/avatar';
import { StyledP } from '@ui-library/common.styled';
import { ftDecimals, getTicker } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const AvatarContainer = styled.div`
  margin-right: ${(props) => props.theme.space.xs};
`;

const Row = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: '24px',
});

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
        <Avatar
          src={
            <TokenImage
              currency="FT"
              fungibleToken={mapRuneNameToPlaceholder(runeName, symbol, inscriptionId)}
              showProtocolIcon={false}
              loading={false}
              size={32}
            />
          }
        />
      </AvatarContainer>
      <Column>
        <Row>
          <StyledP typography="body_medium_m" color="white_200">
            {t('AMOUNT')}
          </StyledP>
          <NumericFormat
            value={amountWithDecimals}
            displayType="text"
            thousandSeparator
            suffix={` ${symbol}`}
            renderText={(value: string) => (
              <StyledPRight
                typography="body_medium_m"
                color={hasSufficientBalance ? 'white_200' : 'danger_light'}
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
