import { mapRuneNameToPlaceholder } from '@components/confirmBtcTransaction/utils';
import TokenImage from '@components/tokenImage';
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
  tokenName: string;
  amount: string;
  divisibility: number;
  hasSufficientBalance?: boolean;
};

export default function RuneAmount({
  tokenName,
  amount,
  divisibility,
  hasSufficientBalance = true,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const amountWithDecimals = ftDecimals(amount, divisibility);
  return (
    <Container>
      <AvatarContainer>
        <Avatar
          src={
            <TokenImage
              currency="FT"
              fungibleToken={mapRuneNameToPlaceholder(tokenName)}
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
            suffix={` ${getTicker(tokenName)}`}
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
          {tokenName}
        </StyledP>
      </Column>
    </Container>
  );
}
