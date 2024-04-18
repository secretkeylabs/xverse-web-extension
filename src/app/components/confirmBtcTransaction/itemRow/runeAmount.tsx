import { mapRuneNameToPlaceholder } from '@components/confirmBtcTransaction/utils';
import TokenImage from '@components/tokenImage';
import Avatar from '@ui-library/avatar';
import { StyledP } from '@ui-library/common.styled';
import { getTicker } from '@utils/helper';
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

const ColumnContainer = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '24px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
});

const AmountDiv = styled.div`
  flex: 3;
  overflow: hidden;
`;

const NumberTypeContainer = styled.div`
  flex: 1;
  text-align: right;
  overflow: hidden;
`;

const EllipsisStyledP = styled(StyledP)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

type Props = {
  tokenName: string;
  amount: string;
  hasSufficientBalance?: boolean;
};

export default function RuneAmount({ tokenName, amount, hasSufficientBalance = true }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

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
      <ColumnContainer>
        <AmountDiv>
          <StyledP typography="body_medium_m" color="white_200">
            {t('AMOUNT')}
          </StyledP>
          <EllipsisStyledP typography="body_medium_s" color="white_400">
            {tokenName}
          </EllipsisStyledP>
        </AmountDiv>
        <NumberTypeContainer>
          <NumericFormat
            value={amount}
            displayType="text"
            thousandSeparator
            suffix={` ${getTicker(tokenName)}`}
            renderText={(value: string) => (
              <EllipsisStyledP
                typography="body_medium_m"
                color={hasSufficientBalance ? 'white_200' : 'danger_light'}
              >
                {value}
              </EllipsisStyledP>
            )}
          />
        </NumberTypeContainer>
      </ColumnContainer>
    </Container>
  );
}
